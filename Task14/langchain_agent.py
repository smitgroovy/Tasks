"""
LangChain Multi-Step Agent Loop
Uses OpenRouter API with reasoning
"""

from langchain_core.tools import tool
from langchain_core.prompts import PromptTemplate
from config import get_client, OPENROUTER_MODEL

# Define tools the agent can use
@tool
def search_web(query: str) -> str:
    """Search the web for information about a query."""
    results = {
        "python": "Python is a high-level programming language created by Guido van Rossum in 1991.",
        "langchain": "LangChain is a framework for building LLM-powered applications.",
        "ai": "Artificial Intelligence is intelligence demonstrated by machines.",
        "nvidia": "NVIDIA is a leader in GPU computing and AI hardware.",
        "nim": "NVIDIA NIMs provides optimized inference microservices for AI models."
    }
    query_lower = query.lower()
    for key, value in results.items():
        if key in query_lower:
            return value
    return f"Found general information about: {query}"

@tool
def calculate(expression: str) -> str:
    """Calculate a mathematical expression safely."""
    try:
        allowed_chars = set("0123456789+-*/(). ")
        if all(c in allowed_chars for c in expression):
            result = eval(expression)
            return f"Calculation result: {result}"
        return "Error: Invalid characters in expression"
    except Exception as e:
        return f"Calculation error: [e]"

@tool
def get_current_time() -> str:
    """Get the current date and time."""
    from datetime import datetime
    return f"Current date and time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

def call_llm_with_history(messages):
    """Call OpenRouter API preserving reasoning_details."""
    client = get_client()
    response = client.chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=messages,
        extra_body={"reasoning": {"enabled": True}}
    )
    return response.choices[0].message

def parse_llm_output(text: str) -> dict:
    """Parse the LLM output to extract action and input."""
    lines = text.strip().split("\n")
    result = {"thought": "", "action": None, "action_input": None, "final_answer": None}
    
    for line in lines:
        line_lower = line.lower().strip()
        if line_lower.startswith("thought:"):
            result["thought"] = line[8:].strip()
        elif line_lower.startswith("action:"):
            result["action"] = line[7:].strip()
        elif line_lower.startswith("action input:"):
            result["action_input"] = line[13:].strip()
        elif line_lower.startswith("final answer:"):
            result["final_answer"] = line[13:].strip()
    
    return result

def run_agent(query: str, max_iterations: int = 10):
    """Run the agent with a query using manual ReAct loop."""
    tools = [search_web, calculate, get_current_time]
    tools_dict = {t.name: t for t in tools}
    
    print(f"\nQuery: {query}")
    print("=" * 50)
    
    # Build the prompt
    tools_text = "\n".join([f"- {t.name}: {t.description}" for t in tools])
    tool_names = ", ".join([t.name for t in tools])
    
    prompt = PromptTemplate.from_template("""
You are a helpful AI assistant that uses tools to answer questions.

You have access to the following tools:
{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}
""")
    
    system_prompt = prompt.format(
        tools=tools_text,
        tool_names=tool_names,
        input=query,
        agent_scratchpad=""
    )
    
    # Initial messages
    messages = [{"role": "user", "content": system_prompt}]
    
    # First call
    response = call_llm_with_history(messages)
    ai_message = response.content
    print(f"LLM Response:\n{ai_message}")
    
    # Build messages with reasoning_details preserved
    messages.append({
        "role": "assistant",
        "content": ai_message,
        "reasoning_details": response.reasoning_details
    })
    
    for iteration in range(max_iterations):
        print(f"\n--- Iteration {iteration + 1} ---")
        
        # Parse response
        parsed = parse_llm_output(ai_message)
        
        # Check for final answer
        if parsed["final_answer"]:
            print(f"\n{'='*50}")
            print(f"Final Answer: {parsed['final_answer']}")
            return parsed["final_answer"]
        
        # Execute tool if action exists
        if parsed["action"] and parsed["action"] in tools_dict:
            print(f"\nExecuting tool: {parsed['action']}")
            print(f"Input: {parsed['action_input']}")
            
            tool_result = tools_dict[parsed["action"]].invoke(parsed["action_input"])
            print(f"Result: {tool_result}")
            
            # Add observation
            messages.append({"role": "user", "content": f"Observation: {tool_result}\n\nNow continue with the next Thought/Action or provide Final Answer."})
        else:
            messages.append({"role": "user", "content": "Please provide a valid Action from the available tools, or give your Final Answer."})
        
        # Call LLM with history
        response = call_llm_with_history(messages)
        ai_message = response.content
        print(f"LLM Response:\n{ai_message}")
        
        # Preserve reasoning_details
        messages.append({
            "role": "assistant",
            "content": ai_message,
            "reasoning_details": response.reasoning_details
        })
    
    return "Reached maximum iterations without a final answer."

if __name__ == "__main__":
    print("LangChain Agent with OpenRouter")
    print("=" * 50)
    
    queries = [
        "What is Python?",
        "Calculate 25 * 4",
        "What time is it now?",
        "Tell me about NVIDIA"
    ]
    
    for query in queries:
        try:
            result = run_agent(query)
        except Exception as e:
            print(f"Error: {e}")
        print("\n" + "-" * 50)
