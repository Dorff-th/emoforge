# graph_feedback.py (수정본)
import os
import random
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END

load_dotenv()

llm = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7
)

class FeedbackState(dict):
    content: str
    feedbackType: str
    style: str
    result: str

def select_style(state: FeedbackState) -> FeedbackState:
    feedbackType = state["feedbackType"]

    styles = {
        "encourage": "[피드백 스타일: 따뜻하고 긍정적이며 응원하는 말투]",
        "scold": "[피드백 스타일: 엄격하고 직설적으로 지적하는 말투]",
        "roast": "[피드백 스타일: 유머를 섞어 가볍게 놀리면서 지적하는 말투]",
        "coach": "[피드백 스타일: 냉정하고 목표지향적인 조언자 말투]",
        "random": random.choice([
            "[피드백 스타일: 따뜻하고 긍정적이며 응원하는 말투]",
            "[피드백 스타일: 엄격하고 직설적으로 지적하는 말투]",
            "[피드백 스타일: 유머를 섞어 가볍게 놀리면서 지적하는 말투]",
            "[피드백 스타일: 냉정하고 목표지향적인 조언자 말투]",
        ]),
        "default": "[피드백 스타일: 무난한 말투]"
    }

    # ✅ state 업데이트 후 반드시 반환
    state["style"] = styles.get(feedbackType, styles["encourage"])
    return state

def generate_feedback(state: FeedbackState) -> FeedbackState:
    style = state["style"]
    content = state["content"]

    prompt = f"""
    아래 회고 내용을 {style}로 피드백 해줘.
    회고: {content}
    조건: 
    - 스타일에 맞춰 반드시 한두 문장만 줄 것
    - 스타일에 따라 말투가 명확하게 구분되어야 함
    - 지시된 스타일과 다르게 응답하면 안 됨
    """

    response = llm.invoke([
        SystemMessage(content="You are a feedback coach that adjusts tone based on the requested style."),
        HumanMessage(content=prompt)
    ])
    state["result"] = response.content
    return state

graph = StateGraph(FeedbackState)
graph.add_node("select_style", select_style)
graph.add_node("generate_feedback", generate_feedback)
graph.add_edge(START, "select_style")
graph.add_edge("select_style", "generate_feedback")
graph.add_edge("generate_feedback", END)

compiled_feedback_graph = graph.compile()
