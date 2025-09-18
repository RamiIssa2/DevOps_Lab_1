import os


def generate_ps1_file(token: str, chat_id: str, msg_text: str):
    ps1_content = r'''
$token = "token_to_replace"
$chatId = "chat_id_to_replace"
$text = @"
msg_text_to_replace
"@

$body = @{
    chat_id = $chatId
    text = $text
    parse_mode = "HTML"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/sendMessage" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
'''

    ps1_content = ps1_content.replace("token_to_replace", token)
    ps1_content = ps1_content.replace("chat_id_to_replace", chat_id)
    ps1_content = ps1_content.replace("msg_text_to_replace", msg_text)

    with open("SendMessage.ps1", "w", encoding="utf-8") as file:
        file.write(ps1_content)

    print("✅ PowerShell script created: SendMessage.ps1")


if __name__ == "__main__":
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    msg_text = os.getenv("TELEGRAM_MESSAGE")

    generate_ps1_file(token, chat_id, msg_text)