"""One Claude API call: a system prompt and a message go in; text and the token counts come out.

Needs: pip install anthropic, and a credential (ANTHROPIC_API_KEY, or `ant auth login`).
"""
import anthropic

PRICE_IN, PRICE_OUT = 4.00, 20.00          # USD for 1 million tokens, claude-opus-5-5 (see the pricing page)

client = anthropic.Anthropic()             # reads the credential from the environment

response = client.beta.messages.create(
    model="claude-opus-5-5",
    max_tokens=16000,
    system="You answer questions about a small bike shop. Answer in two sentences or less.",
    messages=[{"role": "user", "content": "Can I return a bike after two weeks?"}],
    # If the model declines the request, the API runs it again on a fallback model.
    betas=["server-side-fallback-2026-07-01"],
    fallbacks="default",
)

if response.stop_reason == "refusal":
    print("The model declined this request.")
else:
    for block in response.content:         # the reply is a list of blocks; print the text blocks
        if block.type == "text":
            print(block.text)

usage = response.usage
cost = (usage.input_tokens * PRICE_IN + usage.output_tokens * PRICE_OUT) / 1_000_000
print(f"input tokens:  {usage.input_tokens}")
print(f"output tokens: {usage.output_tokens}")
print(f"cost: ${cost:.5f}")
