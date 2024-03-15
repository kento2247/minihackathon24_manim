from manim import *

class ViTAnimation(Scene):
    def construct(self):
        # 入力画像
        image = Rectangle(width=4, height=4, fill_color=BLUE, fill_opacity=0.5)
        self.play(Create(image))
        self.wait(1)

        # パッチに分割
        patches = VGroup(*[Square(side_length=0.5, fill_color=BLUE, fill_opacity=0.5) for _ in range(64)])
        patches.arrange_in_grid(rows=8, cols=8, buff=0)
        self.play(ReplacementTransform(image, patches))
        self.wait(1)

        text1 = Text("1. 画像をパッチに分割", font_size=24).to_edge(UP + LEFT)
        self.play(Write(text1))
        self.wait(2)
        self.play(FadeOut(text1))

        # 各パッチをベクトルに変換
        patch_vectors = VGroup(*[Dot(radius=0.1, color=BLUE) for _ in range(64)])
        patch_vectors.arrange_in_grid(rows=8, cols=8, buff=0.5)
        self.play(ReplacementTransform(patches, patch_vectors))
        self.wait(1)

        text2 = Text("2. 各パッチをベクトルに変換", font_size=24).to_edge(UP + LEFT)
        self.play(Write(text2))
        self.wait(2)
        self.play(FadeOut(text2))

        # [class]トークン付加と位置エンコーディング
        class_token = Star(color=RED, fill_opacity=1).scale(0.3)
        patch_vectors_with_class_token = VGroup(class_token, *patch_vectors)
        patch_vectors_with_class_token.arrange(RIGHT, buff=0.5)
        self.play(ReplacementTransform(patch_vectors, patch_vectors_with_class_token))
        self.wait(1)

        text3 = Text("3. [class]トークン付加と位置エンコーディング", font_size=24).to_edge(UP + LEFT)
        self.play(Write(text3))
        self.wait(2)
        self.play(FadeOut(text3))

        # Transformer Encoder
        transformer_output = VGroup(*[Dot(radius=0.1, color=RED) for _ in range(65)])
        transformer_output.arrange(RIGHT, buff=0.5)
        self.play(ReplacementTransform(patch_vectors_with_class_token, transformer_output))
        self.wait(1)

        text4 = Text("4. Transformer Encoder", font_size=24).to_edge(UP + LEFT)
        self.play(Write(text4))
        self.wait(2)
        self.play(FadeOut(text4))

        # 出力の0番目のベクトルをMLP Headで処理
        output_vector = transformer_output[0]
        output_class = Text("Class", font_size=24).next_to(output_vector, DOWN)
        self.play(output_vector.animate.scale(2), Write(output_class))
        self.wait(1)

        text5 = Text("5. 出力の0番目のベクトルをMLP Headで処理", font_size=24).to_edge(UP + LEFT)
        self.play(Write(text5))
        self.wait(2)
        self.play(FadeOut(text5))

        self.wait(2)
