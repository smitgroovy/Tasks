"""
LlamaIndex Query Engine Agent
Uses OpenRouter API with reasoning
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from config import get_client, OPENROUTER_MODEL

@dataclass
class ToolResult:
    """Result from a tool execution."""
    success: bool
    output: str
    metadata: Dict[str, Any] = None

class BaseTool:
    """Base class for tools."""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    def run(self, input_text: str) -> ToolResult:
        raise NotImplementedError

class SearchTool(BaseTool):
    """Tool for searching information."""
    
    def __init__(self):
        super().__init__(
            name="search",
            description="Search for information on a topic"
        )
        self.knowledge_base = {
            "python": "Python is a high-level programming language known for its simplicity and versatility, created by Guido van Rossum in 1991.",
            "langchain": "LangChain is a framework for building applications powered by language models.",
            "llamaindex": "LlamaIndex is a data framework for building LLM applications with your data.",
            "ai": "Artificial Intelligence enables machines to mimic human intelligence and learning.",
            "nvidia": "NVIDIA is a leader in GPU computing, AI hardware, and accelerated computing.",
            "nim": "NVIDIA NIMs (NVIDIA Inference Microservices) provides optimized containers for deploying AI models."
        }
    
    def run(self, input_text: str) -> ToolResult:
        query = input_text.lower()
        results = []
        for key, value in self.knowledge_base.items():
            if key in query:
                results.append(value)
        
        if results:
            return ToolResult(True, " ".join(results))
        return ToolResult(True, f"Found general information about: {input_text}")

class CalculatorTool(BaseTool):
    """Tool for mathematical calculations."""
    
    def __init__(self):
        super().__init__(
            name="calculate",
            description="Perform mathematical calculations"
        )
    
    def run(self, input_text: str) -> ToolResult:
        try:
            allowed_chars = set("0123456789+-*/(). ")
            if all(c in allowed_chars for c in input_text):
                result = eval(input_text)
                return ToolResult(True, f"Result: {result}")
            return ToolResult(False, "Invalid mathematical expression")
        except Exception as e:
            return ToolResult(False, f"Calculation error: [e]")

class TimeTool(BaseTool):
    """Tool for getting current time."""
    
    def __init__(self):
        super().__init__(
            name="time",
            description="Get current date and time"
        )
    
    def run(self, input_text: str = "") -> ToolResult:
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return ToolResult(True, f"Current time: {current_time}")

class QueryEngine:
    """Query engine using OpenRouter API with reasoning."""
    
    def __init__(self):
        self.client = get_client()
        self.tools: List[BaseTool] = []
        self.memory: List[Dict[str, str]] = []
    
    def add_tool(self, tool: BaseTool):
        """Add a tool to the engine."""
        self.tools.append(tool)
    
    def _get_tool_by_name(self, name: str) -> Optional[BaseTool]:
        """Get a tool by its name."""
        for tool in self.tools:
            if tool.name.lower() == name.lower():
                return tool
        return None
    
    def _call_llm(self, messages: List[Dict[str, str]]) -> tuple:
        """Call OpenRouter API. Returns (content, reasoning_details)."""
        try:
            response = self.client.chat.completions.create(
                model=OPENROUTER_MODEL,
                messages=messages,
                extra_body={"reasoning": {"enabled": True}}
            )
            msg = response.choices[0].message
            return msg.content, msg.reasoning_details
        except Exception as e:
            return f"API Error: [e]", None
    
    def _parse_action(self, response: str) -> tuple:
        """Parse action and input from LLM response."""
        response_lower = response.lower()
        
        for tool in self.tools:
            if tool.name in response_lower:
                idx = response_lower.index(tool.name)
                input_text = response[idx + len(tool.name):].strip()
                for prefix in [":", "is", "=", "of"]:
                    if input_text.lower().startswith(prefix):
                        input_text = input_text[len(prefix):].strip()
                return tool.name, input_text
        
        return None, None
    
    def query(self, question: str, max_steps: int = 5) -> str:
        """
        Process a query through multiple reasoning steps.
        """
        self.memory.append({"role": "user", "content": question})
        
        tools_desc = "\n".join([f"- {t.name}: {t.description}" for t in self.tools])
        
        system_prompt = f"""You are a helpful AI assistant with access to tools.

Available tools:
{tools_desc}

To use a tool, respond with:
Action: <tool_name>
Action Input: <input>

When you have the answer, respond with:
Final Answer: <your answer>

Think step by step and use tools when needed."""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ]
        
        for step in range(max_steps):
            # Get LLM response
            content, reasoning_details = self._call_llm(messages)
            
            # Build assistant message with reasoning_details
            assistant_msg = {
                "role": "assistant",
                "content": content,
                "reasoning_details": reasoning_details
            }
            messages.append(assistant_msg)
            self.memory.append({"role": "assistant", "content": content})
            
            print(f"\nStep {step + 1}:")
            print(f"Response: {content[:200]}...")
            
            # Check if we have a final answer
            if "final answer" in content.lower():
                idx = content.lower().index("final answer")
                return content[idx + len("final answer"):].strip(": ")
            
            # Try to execute a tool
            tool_name, tool_input = self._parse_action(content)
            if tool_name:
                tool = self._get_tool_by_name(tool_name)
                if tool:
                    result = tool.run(tool_input)
                    observation = f"Observation: {result.output}"
                    messages.append({"role": "user", "content": observation})
                    self.memory.append({"role": "tool", "content": result.output})
                    
                    print(f"Tool: {tool_name} => {result.output[:100]}")
                    
                    # If we've used 2+ tools, generate final answer
                    if len([m for m in self.memory if m["role"] == "tool"]) >= 2:
                        final_prompt = "Based on the observations above, provide a Final Answer."
                        messages.append({"role": "user", "content": final_prompt})
                        final_content, _ = self._call_llm(messages)
                        return final_content
        
        return "I've completed my analysis. Please see the information gathered above."

class LlamaIndexAgent:
    """Multi-step agent using query engine pattern with OpenRouter."""
    
    def __init__(self):
        self.query_engine = QueryEngine()
        self._setup_tools()
    
    def _setup_tools(self):
        """Initialize and add tools."""
        self.query_engine.add_tool(SearchTool())
        self.query_engine.add_tool(CalculatorTool())
        self.query_engine.add_tool(TimeTool())
    
    def run(self, question: str) -> str:
        """Run the agent with a question."""
        return self.query_engine.query(question)

def main():
    """Main function to demonstrate the agent."""
    print("LlamaIndex Agent with OpenRouter")
    print("=" * 50)
    
    agent = LlamaIndexAgent()
    
    queries = [
        "What is Python?",
        "What time is it now?",
        "Calculate 15 + 27"
    ]
    
    for query in queries:
        print(f"\n{'='*50}")
        print(f"Query: {query}")
        print('='*50)
        try:
            result = agent.run(query)
            print(f"\nFinal Answer: {result}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
