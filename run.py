import argparse
import os
import re
import subprocess

from Claude3.run import run


def parse_args():
    parser = argparse.ArgumentParser()

    parser.add_argument('--prompt', type=str)
    parser.add_argument('--path_code', type=str, default='vit.py')
    parser.add_argument('--dir_image', type=str, default="Images/")
    parser.add_argument('--image', type=str, default="vit.png")

    parser.add_argument('--output', type=str, default="output.txt")

    parser.add_argument('--dir_output', type=str, default="Output/")

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


def main(args: argparse.Namespace):
    path_image = os.path.join(args.dir_image, args.image)
    content = run(
        image=path_image,
        path_source_code=args.path_code
    )

    with open(args.output, 'w') as f:
        f.write(content)

    code, class_name = extract_code_and_classname(content)
    os.makedirs(args.dir_output, exist_ok=True)
    
    path_code = os.path.join(args.dir_output, "code.py")
    with open(path_code, 'w') as f:
        f.write(code)
    
    command = ['manim', '-pql', path_code, class_name]

    result = subprocess.run(command, capture_output=True, text=True)

    if result.returncode == 0:
        print("標準出力:", result.stdout)
    else:
        print("標準エラー:", result.stderr)


if __name__ == "__main__":
    main(parse_args())