"""A small hand-written corpus for episode 12: a bike-shop handbook and 21 test questions.

Every result in episode 12 is measured on THIS corpus only. It is small and hand-written, so
it shows how the methods work. It does not show how well they work on your documents.

The first paragraph of the Returns, Delivery, Warranty, Payment, Repairs and Sizes sections are the six
chunks of episode 7. Each question has the exact sentence (or part of a sentence) that holds the answer.
A chunk is "relevant" to a question when it contains that text completely.
"""

HANDBOOK = [
    ("Returns", [
        "You can return a bike within 30 days of delivery. The bike must be unused and in the original box. "
        "We refund the full price to your card.",
        "Accessories follow the same 30 days. Helmets must keep their seal. Opened helmets and used inner tubes "
        "cannot be returned, for reasons of hygiene and safety.",
        "Sale items can be returned within 14 days only. Custom builds are made for you, so we cannot take them "
        "back unless the bike has a fault. To start a return, write to the returns desk with your order number.",
        "After the bike arrives at our warehouse, a check takes 2 working days. The refund then reaches your "
        "card in 5 to 7 days.",
    ]),
    ("Delivery", [
        "Standard delivery takes 3 to 5 working days. Express delivery takes 1 day and costs 15 dollars.",
        "Delivery is free for orders above 500 dollars. Below that, standard delivery costs 9 dollars. We deliver "
        "to all cities in the country, but not to islands.",
        "You get a tracking link by email when the bike leaves the warehouse. The courier calls you before the "
        "visit. Someone over 18 must sign for the box.",
        "If the box arrives damaged, take photos before you open it. Write to us within 48 hours. We send a new "
        "bike or a refund, and you pay nothing.",
        "We deliver to the neighbouring countries too. It takes 7 to 10 working days, and customs fees are paid "
        "by the buyer.",
    ]),
    ("Warranty", [
        "Every frame has a 5-year warranty. Brakes, chains and tires have a 1-year warranty.",
        "The warranty covers faults in material and work. It does not cover wear from normal use, crashes, or a "
        "bike that was not serviced as the manual says.",
        "To claim, send your order number and two photos of the fault. We reply within 3 working days. If we "
        "accept the claim, we repair the part or send a new one.",
        "E-bike batteries have a 2-year warranty or 500 full charge cycles, whichever comes first.",
    ]),
    ("Payment", [
        "We accept cards and bank transfer. You pay when you place the order.",
        "You can pay in 6 monthly instalments with no interest for orders above 800 dollars. A credit check is "
        "needed and takes a few minutes.",
        "Companies can ask for an invoice with 30 days to pay. The invoice shows the tax number of the shop and "
        "the details of your company.",
    ]),
    ("Repairs", [
        "Our workshop repairs bikes from any shop. A basic service costs 60 dollars and takes 2 days.",
        "A full service costs 120 dollars and takes 4 days. It includes a deep clean of the drivetrain, new "
        "cables and a brake bleed for disc brakes.",
        "Puncture repair costs 15 dollars, and the job takes about 20 minutes. Wheel truing costs 25 dollars.",
        "Book a workshop slot online or by phone. Walk-in jobs are possible on weekdays when the workshop has "
        "free time. We keep your bike for free for 7 days after the work, then we charge 3 dollars a day.",
    ]),
    ("Sizes", [
        "Choose the frame size from your height. Riders from 165 to 175 cm need a medium frame.",
        "Riders below 165 cm need a small frame. Riders above 175 cm and up to 185 cm need a large frame.",
        "A bike fit costs 40 dollars. A fitter adjusts the saddle, the handlebar and the pedals to your body. "
        "It takes about 45 minutes.",
        "You can test ride any bike in the shop for 15 minutes. Bring an ID card. For e-bikes the test ride "
        "takes 30 minutes.",
    ]),
    ("Assembly", [
        "Bikes arrive 90 percent assembled. You must fit the front wheel, the handlebar and the pedals. This "
        "takes about 30 minutes with the tool kit in the box.",
        "If you prefer, our workshop builds the bike before delivery for 30 dollars. The fee is added to the "
        "order. This keeps the warranty valid.",
    ]),
    ("E-bikes", [
        "An e-bike battery gives 60 to 100 km of range. The range depends on the level of assistance and on the "
        "weight of the rider.",
        "A full charge takes 4 hours. Do not leave the battery in a hot car. In winter, store it at about 50 "
        "percent charge.",
        "Batteries travel with a special courier because of safety rules. This is why e-bike delivery takes 5 "
        "to 7 working days.",
    ]),
    ("Care", [
        "Lubricate the chain every 200 km or after a ride in the rain. Use a thin oil and wipe off the extra.",
        "Check the tire pressure every week. Road tires need 6 to 8 bar. Mountain bike tires need 1.5 to 2.5 bar.",
        "Brake pads wear out. Change them when the pad is less than 1 mm thick, or when the brake feels soft.",
    ]),
    ("Contact", [
        "The shop is open Monday to Friday from 9 to 18 and on Saturday from 10 to 16. We are closed on Sunday "
        "and on public holidays.",
        "Phone support answers during opening hours. Email questions get an answer within 1 working day.",
    ]),
    ("Trade-in", [
        "We buy used bikes that are less than 5 years old. Send three photos and the model name. We give you an "
        "offer within 2 working days.",
        "We pay the trade-in value as a voucher for the shop. The voucher is valid for 12 months.",
    ]),
    ("Rentals", [
        "You can rent a city bike for 20 dollars a day or 100 dollars a week. A helmet and a lock are included.",
        "A deposit of 150 dollars is held on your card and released when you return the bike. Each extra day "
        "of late return costs 25 dollars.",
    ]),
    ("Accessories", [
        "We sell helmets, locks, lights and bags. Locks of our top class include a theft cover of up to 300 "
        "dollars for the first year.",
        "A set of front and rear lights costs 25 dollars. The lights charge by USB and last 6 hours.",
    ]),
    ("Loyalty", [
        "Each purchase gives you points. You get 1 point for each dollar. 100 points give you a 5 dollar voucher.",
        "Points expire after 24 months. Members get 10 percent off the workshop service.",
    ]),
]

# (question, the text that holds the answer)
QUESTIONS = [
    ("Can I return a bike after two weeks?", "You can return a bike within 30 days of delivery."),
    ("How long does express delivery take?", "Express delivery takes 1 day"),
    ("What does it cost to fix my bike?", "A basic service costs 60 dollars and takes 2 days."),
    ("How much does a puncture repair cost?", "Puncture repair costs 15 dollars"),
    ("How long is the warranty on a battery?", "E-bike batteries have a 2-year warranty"),
    ("How long does delivery of an e-bike take?", "e-bike delivery takes 5 to 7 working days"),
    ("What do I do if my parcel arrives broken?", "If the box arrives damaged, take photos before you open it."),
    ("Which frame size fits a rider who is 180 cm tall?", "Riders above 175 cm and up to 185 cm need a large frame."),
    ("Can a company pay later with an invoice?", "Companies can ask for an invoice with 30 days to pay."),
    ("How much is it to rent a bike for a week?", "100 dollars a week"),
    ("When is the shop open on Saturday?", "on Saturday from 10 to 16"),
    ("How much does a full service cost?", "A full service costs 120 dollars and takes 4 days."),
    ("How often should I oil the chain?", "Lubricate the chain every 200 km"),
    ("Can I get a refund on sale items?", "Sale items can be returned within 14 days only."),
    ("What happens to my deposit when I bring the rented bike back?", "released when you return the bike"),
    ("How many points do I need for a voucher?", "100 points give you a 5 dollar voucher."),
    ("How long does the refund take to reach my card?", "The refund then reaches your card in 5 to 7 days."),
    ("Who pays customs fees when you send a bike abroad?", "customs fees are paid by the buyer"),
    ("What tire pressure does a road bike need?", "Road tires need 6 to 8 bar."),
    ("Can I try a bike before I buy it?", "You can test ride any bike in the shop for 15 minutes."),
    ("How long does a battery take to charge?", "A full charge takes 4 hours."),
]


def paragraphs() -> list[tuple[str, str]]:
    """The handbook as (section title, paragraph text) pairs."""
    return [(title, p) for title, ps in HANDBOOK for p in ps]


def flat_text() -> str:
    """The whole handbook as one text: the paragraphs in order, without the section titles."""
    return " ".join(p for _, p in paragraphs())


def sections() -> list[tuple[str, str]]:
    """The handbook as (title, text of the whole section) pairs."""
    return [(title, " ".join(ps)) for title, ps in HANDBOOK]


def is_relevant(chunk_text: str, evidence: str) -> bool:
    """A chunk is relevant when it holds the answer text completely (a cut in the middle does not count)."""
    return evidence in chunk_text


# A check on the corpus itself: every answer text must appear exactly once.
for _q, _e in QUESTIONS:
    assert flat_text().count(_e) == 1, f"evidence must appear exactly once: {_e!r}"

if __name__ == "__main__":
    ps = paragraphs()
    print(f"{len(HANDBOOK)} sections, {len(ps)} paragraphs, {len(flat_text().split())} words, {len(QUESTIONS)} questions")
    for title, text in sections():
        print(f"  {title:<12} {len(text.split()):>4} words")
