import datetime
from flask import Flask, request, jsonify
import argparse
import os
import re
import subprocess
from Claude3.run import run

app = Flask(__name__)


def parse_args( code_name="vit.py", image_name="vit.png"):
    parser = argparse.ArgumentParser()

    parser.add_argument('--prompt', type=str)
    parser.add_argument('--dir_input', type=str, default="../frontend/uploads/")
    parser.add_argument('--dir_output', type=str, default="Output/")
    parser.add_argument('--code', type=str, default=code_name)
    parser.add_argument('--image', type=str, default=image_name)
    parser.add_argument('--dir_mp4_output', type=str, default="media/videos/code/480p15/")

    return parser.parse_args()


def extract_code_and_classname(text):
    code_pattern = r"```python\n(.*?)```"
    code_match = re.search(code_pattern, text, re.DOTALL)
    if code_match:
        code_text = code_match.group(1)
    else:
        return "コードが見つかりません", None

    class_name_pattern = r"class\s+(\w+)\("
    class_name_match = re.search(class_name_pattern, code_text)
    if class_name_match:
        class_name = class_name_match.group(1)
    else:
        class_name = None

    return code_text, class_name


def main(args: argparse.Namespace, have_apiAmount=True):
    path_image = os.path.join(args.dir_input, args.image)
    path_code= os.path.join(args.dir_input,  args.code)
    class_name = None

    if have_apiAmount:
        content = run(
            image=path_image,
            path_source_code=path_code
        )
        print ("Claude3 completed.")
        code, class_name = extract_code_and_classname(content)
        print("class_name:", class_name)
        path_code = os.path.join(args.dir_output, "code.py")
        with open(path_code, 'w') as f:
            f.write(code)
    else:
        # 残高不使用のために、一時的に作成
        class_name="ViTAnimation"   
        path_code = os.path.join(args.dir_output, "code.py")

    os.makedirs(args.dir_output, exist_ok=True)
    
    command = ['manim', '-pql', path_code, class_name]


    result = subprocess.run(command, capture_output=True, text=True)

    if result.returncode == 0:
        print("標準出力:", result.stdout)
        return f"{os.getcwd()}/media/videos/code/480p15/{class_name}Animation.mp4"
    else:
        print("標準エラー:", result.stderr)


@app.route('/submit', methods=['POST'])
def submit():
    #現在時刻を取得
    now = datetime.datetime.now()
    print("post arrived. time=", now.strftime('%Y-%m-%d %H:%M:%S'))
    # リクエストから引数をパースする
    image_name = request.json.get('image_name')  # リクエストから画像名を取得
    code_name = request.json.get('code_name')
    output_name = request.json.get('output_name')
    print("image_name:", image_name)
    print("code_name:", code_name)
    args = parse_args(code_name, image_name)
    
    # main関数を実行する
    result_path=main(args, have_apiAmount=True)

    print("Processing complete")
    
    # レスポンスを返す
    return jsonify({"message": "Processing complete", "result_path": result_path})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=False)
