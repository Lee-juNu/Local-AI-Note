import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Mic, MessageSquare, Image } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">AI機能ギャラリー</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/whisper" className="block">
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mic className="mr-2" />
                音声のテキスト化
              </CardTitle>
              <CardDescription>
                Whisperを使用して音声をテキストに変換
              </CardDescription>
            </CardHeader>
            <CardContent>
              音声ファイルをアップロードし、高精度なテキスト変換を体験してください。
            </CardContent>
          </Card>
        </Link>

        <Link href="/chat" className="block">
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2" />
                ChatAI
              </CardTitle>
              <CardDescription>
                OpenAIのChatGPTを使用したチャットボット
              </CardDescription>
            </CardHeader>
            <CardContent>
              AIと自然な会話を楽しみ、質問に対する回答を得ることができます。
            </CardContent>
          </Card>
        </Link>

        <Link href="/ai-features/stable-diffusion" className="block">
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="mr-2" />
                AI画像生成
              </CardTitle>
              <CardDescription>
                Stable Diffusionを使用した画像生成
              </CardDescription>
            </CardHeader>
            <CardContent>
              テキストプロンプトから独創的な画像を生成します。あなたのアイデアを視覚化しましょう。
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
