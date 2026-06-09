# Production CLI Architecture

src/
providers/
core/
utils/
logs/
tests/

Flow:
User Input -> Provider Router -> Retry Layer -> Streaming Layer -> Token Tracking -> Cost Tracking -> Logger -> Output
