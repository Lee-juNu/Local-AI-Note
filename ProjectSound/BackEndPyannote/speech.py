import os
from pyannote.audio import Pipeline
from pydub import AudioSegment
import torch
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()
hugging_token = os.getenv("HUGGINGFACE_TOKEN")

# PyAnnote 모델 로드
pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1",
    use_auth_token=hugging_token
)

# GPU 사용 설정
pipeline.to(torch.device("cuda" if torch.cuda.is_available() else "cpu"))

# 원본 오디오 파일
audio_file = "output.wav"
diarization = pipeline(audio_file, num_speakers=2)

# 원본 오디오 로드
audio = AudioSegment.from_wav(audio_file)

# 화자별 오디오 저장
output_dir = "split_audio"
os.makedirs(output_dir, exist_ok=True)

speaker_files = {}

for turn, _, speaker in diarization.itertracks(yield_label=True):
    start_time = int(turn.start * 1000)  # PyAnnote는 초 단위, pydub은 밀리초 단위
    end_time = int(turn.end * 1000)
    segment = audio[start_time:end_time]

    speaker_file = os.path.join(output_dir, f"{speaker}.wav")
    
    if speaker in speaker_files:
        # 기존 파일에 추가
        speaker_files[speaker] += segment
    else:
        # 새로운 화자 오디오 생성
        speaker_files[speaker] = segment

# 파일 저장
for speaker, segment in speaker_files.items():
    segment.export(os.path.join(output_dir, f"{speaker}.wav"), format="wav")

print("✅ 화자 분리 완료!")
