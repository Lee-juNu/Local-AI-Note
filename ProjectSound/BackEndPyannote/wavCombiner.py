import wave
import os

path = '/content/drive/MyDrive/dataset/' # 병합 하고자 하는 파일이 들어있는 파일로 경로 설정할 것.
file_list = os.listdir(path)

infiles = []
outfile = "output_name.wav" # 출력 wav 이름

# 4의 의미는, 파일을 4개 합치겠다는 뜻. 폴더 전체의 파일을 합치려면 [:]로 작성.
for file in file_list[:4]: # 폴더 내의 파일들을 infiles로 모두 넣어줌
    file_path = os.path.join(path, file)
    infiles.append(file_path)

# infiles 내의 파일들을 하나의 파일로 병합하는 코드
data= []
for infile in infiles:
    w = wave.open(infile, 'rb')
    data.append( [w.getparams(), w.readframes(w.getnframes())] )
    w.close()

output = wave.open(outfile, 'wb')
output.setparams(data[0][0])
for i in range(len(data)):
    output.writeframes(data[i][1])
output.close()
