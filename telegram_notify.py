import os
import asyncio
from telegram import Bot
from telegram.error import RetryAfter

async def main():
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]
    message = os.environ.get("TELEGRAM_MESSAGE", "Pipeline update")

    bot = Bot(token=token)
    try:
        await bot.send_message(chat_id=chat_id, text=message)
        print("Message sent successfully!")
    except RetryAfter as e:
        print(f"Rate limit exceeded. Retry in {e.retry_after} seconds.")
    finally:
        await bot.close()

asyncio.run(main())
