# Use an official PyTorch image as the base
FROM pytorch/pytorch:2.0.0-cuda11.7-cudnn8-runtime

# Set Python version to 3.10
RUN apt-get update && apt-get install -y \
    software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update && apt-get install -y python3.10 python3.10-distutils \
    && rm -rf /var/lib/apt/lists/*

# Set Python3.10 as default
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1

# Install pip for Python 3.10
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10

# Set working directory
WORKDIR /DeepSeek-V3

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt and install Python dependencies
COPY DeepSeek-V3/inference/requirements.txt ./DeepSeek-V3/inference/
RUN python3.10 -m pip install --no-cache-dir -r DeepSeek-V3/inference/requirements.txt

# Install specific dependencies
RUN python3.10 -m pip install torch==2.4.1 triton==3.0.0 transformers==4.46.3 safetensors==0.4.5

# Environment variables for PyTorch distributed training
ENV MASTER_ADDR=localhost
ENV MASTER_PORT=12355
ENV WORLD_SIZE=1
ENV RANK=0

# Expose port for distributed training
EXPOSE 12355

# Copy model weight conversion script and ensure permissions
COPY DeepSeek-V3/inference/convert.py ./DeepSeek-V3/inference/convert.py
RUN chmod +x DeepSeek-V3/inference/convert.py

# Define entrypoint for inference
COPY DeepSeek-V3/inference/generate.py ./DeepSeek-V3/inference/generate.py
COPY DeepSeek-V3/inference/configs ./DeepSeek-V3/inference/configs

# Default command to start the interactive inference (update paths as needed)
CMD ["torchrun", "--nnodes", "2", "--nproc-per-node", "8", "--node-rank", "$RANK", "--master-addr", "$MASTER_ADDR", "DeepSeek-V3/inference/generate.py", "--ckpt-path", "/workspace/DeepSeek-V3-Demo", "--config", "DeepSeek-V3/inference/configs/config_671B.json", "--interactive", "--temperature", "0.7", "--max-new-tokens", "200"]
