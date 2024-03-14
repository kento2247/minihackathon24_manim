import base64

import anthropic

from Claude3.setting import api_key

PROMPT = """
以下に、ある手法におけるmodelのソースコードを示しています。また、論文中に示されているモデル図を別に入力として渡します。
このモデル図の画像中のモデル構造に加え、ソースコードの内容を用いて、モデルの処理を可視化したものをアニメーションで解説したいです。manimを用いてpythonコードを書いてください。
特徴量などは円形を用いて表示すれば良いです。また、各animationが何を表しているかを適宜テキストを表示して説明してください。テキストは図に被らないように、左上に表示するようにしてください。
常に画面内に収まるようにしてください。横幅は850, 縦幅は480です。
versionの関係上、manimのShowCreationはCreateとして実装してださい。

# ソースコード
<code>
"""


def run(image: str, path_source_code: str):
    client = anthropic.Anthropic(api_key=api_key)

    with open(path_source_code, 'r', encoding='utf-8') as file:
        file_contents = file.read()

    prompt = PROMPT.replace("<code>", file_contents)

    with open(image, 'rb') as img_file:
        image_data = img_file.read()
    encoded_image = base64.b64encode(image_data).decode("utf-8")

    extention = image.split('.')[-1]

    message = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=4096,
        temperature=0.0,
        system="",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": f'image/{extention}',  # jpeg, png, gif, webp
                            "data": encoded_image,
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ]
    )

    return message.content[0].text

