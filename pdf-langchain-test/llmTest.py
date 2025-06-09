from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM

template = """Question: {question}

Answer: Let's think step by step."""

prompt = ChatPromptTemplate.from_template(template)

model = OllamaLLM(model="deepseek-r1:8b", base_url="http://host.docker.internal:11434")

chain = prompt | model

result = chain.invoke({"question": "What is LangChain?"})

print(result)
