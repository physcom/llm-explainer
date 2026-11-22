"""Static vs continuous batching, and contiguous vs paged cache memory. Pure Python, no model.

The request lengths below are MADE UP for this lesson. They are not measurements of a real server.
Part 1: a server has 4 slots. Each step, every request in a slot writes one token.
Part 2: the cache of each request is stored in memory. Compare one reserved block per request with paged blocks.
"""
SLOTS = 4
# Number of tokens that each request must write (made-up numbers).
OUTPUT_LENGTHS = [3, 12, 5, 20, 4, 9, 16, 6]

MAX_CONTEXT = 2048       # tokens that a simple server reserves for every request (an assumption)
BLOCK = 16               # tokens in one paged block
SHARED_PREFIX = 512      # tokens of one system prompt that all requests share (an assumption)
# Tokens that each request really holds in its cache (prompt + reply). Made up. Each is above SHARED_PREFIX.
USED_TOKENS = [610, 1200, 760, 1500, 640, 910, 880, 560]


def static_batching(lengths, slots=SLOTS):
    """Fill the slots, wait until the LONGEST request ends, then load the next group."""
    grid = [[] for _ in range(slots)]          # grid[slot][step] = request id, or -1 when the slot is idle
    for start in range(0, len(lengths), slots):
        group = list(range(start, min(start + slots, len(lengths))))
        steps = max(lengths[i] for i in group)
        for s in range(slots):
            for t in range(steps):
                if s < len(group) and t < lengths[group[s]]:
                    grid[s].append(group[s])
                else:
                    grid[s].append(-1)
    return grid


def continuous_batching(lengths, slots=SLOTS):
    """At every step, a free slot takes the next waiting request."""
    queue = list(range(len(lengths)))
    left = [None] * slots                      # tokens that the request in each slot still has to write
    who = [-1] * slots
    grid = [[] for _ in range(slots)]
    while queue or any(x is not None for x in left):
        for s in range(slots):
            if left[s] is None and queue:
                who[s] = queue.pop(0)
                left[s] = lengths[who[s]]
        for s in range(slots):
            if left[s] is None:
                grid[s].append(-1)
            else:
                grid[s].append(who[s])
                left[s] -= 1
                if left[s] == 0:
                    left[s] = None
    return grid


def stats(grid, lengths):
    steps = len(grid[0])
    tokens = sum(lengths)
    return {"steps": steps, "tokens": tokens, "slot_steps": steps * len(grid),
            "idle": steps * len(grid) - tokens, "utilization": tokens / (steps * len(grid))}


def memory(used=USED_TOKENS, max_context=MAX_CONTEXT, block=BLOCK, prefix=SHARED_PREFIX):
    blocks = [-(-u // block) for u in used]                    # ceiling division
    contiguous = len(used) * max_context
    paged = sum(blocks) * block
    shared = paged - (len(used) - 1) * (prefix // block) * block   # the prefix blocks are stored once
    return {"used": sum(used), "contiguous": contiguous, "paged": paged, "paged_shared": shared,
            "waste_contiguous": 1 - sum(used) / contiguous, "waste_paged": 1 - sum(used) / paged,
            "blocks": blocks, "prefix_blocks": prefix // block}


def block_tables(used=USED_TOKENS, block=BLOCK):
    """Hand out physical blocks one request at a time in turn, as requests grow together.
    The blocks of one request end up in different places. The block table maps block 0, 1, 2, ... to a place."""
    need = [-(-u // block) for u in used]
    tables = [[] for _ in used]
    free = 0
    while any(len(t) < n for t, n in zip(tables, need)):
        for i, n in enumerate(need):
            if len(tables[i]) < n:
                tables[i].append(free)
                free += 1
    return tables


if __name__ == "__main__":
    print(f"MADE-UP requests: output lengths {OUTPUT_LENGTHS} tokens, {SLOTS} slots")
    for name, fn in (("static batching    ", static_batching), ("continuous batching", continuous_batching)):
        s = stats(fn(OUTPUT_LENGTHS), OUTPUT_LENGTHS)
        print(f"{name}: {s['steps']:3d} steps, {s['idle']:3d} idle slot-steps, "
              f"slots busy {s['utilization'] * 100:.0f} %")
    print()
    m = memory()
    print(f"cache memory for {len(USED_TOKENS)} requests (made-up lengths), counted in tokens")
    print(f"tokens really held             : {m['used']}")
    print(f"reserved, {MAX_CONTEXT} tokens each     : {m['contiguous']}  (waste {m['waste_contiguous'] * 100:.0f} %)")
    print(f"paged, blocks of {BLOCK} tokens      : {m['paged']}  (waste {m['waste_paged'] * 100:.1f} %)")
    print(f"paged + {SHARED_PREFIX}-token prefix shared: {m['paged_shared']}  (the prefix is stored once, not {len(USED_TOKENS)} times)")
    print(f"blocks per request             : {m['blocks']}")
    print(f"block table of request 1 (first 6): logical 0..5 -> physical {block_tables()[0][:6]}")
