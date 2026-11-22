"""An agent loop: the model asks for a tool, this code runs it and sends the result back,
until the model gives its final answer.

Needs: pip install anthropic, and a credential (ANTHROPIC_API_KEY, or `ant auth login`).
The SDK also has a tool runner (client.beta.messages.tool_runner) that runs this loop for you;
here the loop is written out so that you can see each step.
"""
import json

import anthropic
from anthropic.types.beta import BetaMessageParam, BetaToolParam, BetaToolResultBlockParam

# The data behind the tool. In a real application: a database or another API.
ORDERS = {
    "A-1042": {"status": "out for delivery", "days_left": 1},
    "A-1043": {"status": "in the warehouse", "days_left": 4},
}

# What the model sees: a name, a description, and a JSON schema for the input.
TOOLS: list[BetaToolParam] = [{
    "name": "get_order_status",
    "description": "Look up the delivery status of one order by its id, for example A-1042.",
    "input_schema": {
        "type": "object",
        "properties": {"order_id": {"type": "string", "description": "The order id, for example A-1042."}},
        "required": ["order_id"],
        "additionalProperties": False,
    },
    "strict": True,                        # the input always matches the schema
}]


def get_order_status(order_id: str) -> dict[str, object]:
    if order_id not in ORDERS:
        raise KeyError(f"There is no order with the id {order_id}.")
    return ORDERS[order_id]


client = anthropic.Anthropic()
messages: list[BetaMessageParam] = [{"role": "user", "content": "Where are my orders A-1042 and A-1043?"}]

for turn in range(10):                     # a hard limit, so that a confused loop cannot run forever
    response = client.beta.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        system="You help the customers of a small bike shop. Use the tools to check facts.",
        tools=TOOLS,
        messages=messages,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    )
    messages.append({"role": "assistant", "content": response.content})   # keep every block
    if response.stop_reason != "tool_use":
        break                              # end_turn (the final answer), refusal or max_tokens

    results: list[BetaToolResultBlockParam] = []
    for block in response.content:
        if block.type != "tool_use":
            continue
        print(f"turn {turn}: the model asks for {block.name}({json.dumps(block.input)})")
        try:
            output = get_order_status(str(block.input["order_id"]))
            results.append({"type": "tool_result", "tool_use_id": block.id, "content": json.dumps(output)})
        except KeyError as err:
            results.append({"type": "tool_result", "tool_use_id": block.id, "content": str(err),
                            "is_error": True})
    messages.append({"role": "user", "content": results})          # all results in one message

if response.stop_reason == "refusal":
    print("The model declined this request.")
else:
    print("final answer:", "".join(b.text for b in response.content if b.type == "text"))
