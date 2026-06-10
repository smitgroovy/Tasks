"""
Pure SDK Multi-Step Agent
No frameworks - uses OpenRouter API with reasoning
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from config import get_client, OPENROUTER_MODEL

@dataclass
class AgentState:
    """State of the agent during execution."""
    messages: List[Dict[str, str]] = field(default_factory=list)
    current_step: int = 0
    max_steps: int = 10
    tools_used: List[str] = field(default_factory=list)
    
    def add_message(self, role: str, content: str, reasoning_details=None):
        """Add a message to the conversation history."""
        msg = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }
        if reasoning_details is not None:
            msg["reasoning_details"] = reasoning_details
        self.messages.append(msg)

@dataclass
class Tool:
    """Definition of a tool the agent can use."""
    name: str
    description: str
    function: Any

class AgentLoop:
    """
    Core agent loop implementation with OpenRouter reasoning.
    """
    
    def __init__(self, tools: List[Tool] = None):
        self.tools = {tool.name: tool for tool in (tools or [])}
        self.state = AgentState()
        self.client = get_client()
    
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
    
    def think(self, task: str) -> tuple:
        """Let LLM think about what to do next. Returns (response, reasoning_details)."""
        tools_desc = "\n".join([
            f"- {t.name}: {t.description}" for t in self.tools.values()
        ])
        
        system_prompt = f"""You are an AI agent that can use tools to complete tasks.

Available tools:
{tools_desc}

To use a tool, respond with ONLY:
ACTION: <tool_name>
INPUT: <input>

When you have enough information to answer, respond with ONLY:
ANSWER: <your final answer>

Think step by step."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Task: {task}"}
        ]
        
        # Add conversation history (preserving reasoning_details)
        for msg in self.state.messages[-6:]:
            history_msg = {"role": msg["role"], "content": msg["content"]}
            if "reasoning_details" in msg and msg["reasoning_details"] is not None:
                history_msg["reasoning_details"] = msg["reasoning_details"]
            messages.append(history_msg)
        
        return self._call_llm(messages)
    
    def execute_tool(self, tool_name: str, tool_input: str) -> str:
        """Execute a tool and return the result."""
        if tool_name in self.tools:
            self.state.tools_used.append(tool_name)
            return self.tools[tool_name].function(tool_input)
        return f"Tool '{tool_name}' not found"
    
    def parse_llm_response(self, response: str) -> tuple:
        """Parse the LLM response to extract action or answer."""
        response_upper = response.upper()
        
        if "ANSWER:" in response_upper:
            idx = response_upper.index("ANSWER:")
            return "answer", response[idx + 7:].strip()
        
        if "ACTION:" in response_upper:
            idx = response_upper.index("ACTION:")
            action_text = response[idx + 7:].strip()
            
            lines = action_text.split("\n")
            tool_name = lines[0].strip().lower()
            
            tool_input = ""
            if len(lines) > 1:
                input_line = lines[1].strip()
                if input_line.upper().startswith("INPUT:"):
                    tool_input = input_line[6:].strip()
                else:
                    tool_input = input_line
            
            return "action", (tool_name, tool_input)
        
        return "text", response
    
    def run(self, task: str) -> str:
        """
        Main agent loop - the reason-action cycle.
        """
        print(f"\n{'='*50}")
        print(f"Agent Loop Starting for: {task}")
        print('='*50)
        
        self.state.add_message("user", task)
        
        # First call
        response_content, reasoning_details = self.think(task)
        print(f"LLM Response: {response_content[:200]}...")
        self.state.add_message("assistant", response_content, reasoning_details)
        
        for step in range(self.state.max_steps):
            self.state.current_step = step + 1
            print(f"\n--- Step {step + 1} ---")
            
            # Parse response
            response_type, parsed = self.parse_llm_response(response_content)
            
            if response_type == "answer":
                print(f"\nFinal Answer: {parsed}")
                return parsed
            
            elif response_type == "action":
                tool_name, tool_input = parsed
                print(f"Action: Use {tool_name} with input: {tool_input}")
                
                result = self.execute_tool(tool_name, tool_input)
                print(f"Observation: {result}")
                
                self.state.add_message("user", f"Observation: {result}")
                
                if len(self.state.tools_used) >= 2:
                    self.state.add_message("user", "You have enough information. Provide your final ANSWER.")
            
            else:
                if len(self.state.tools_used) >= 1:
                    return response_content
            
            # Next call with full history
            response_content, reasoning_details = self.think(task)
            print(f"LLM Response: {response_content[:200]}...")
            self.state.add_message("assistant", response_content, reasoning_details)
        
        return "I've reached the maximum number of steps. Please try again."

class PureSDKAgent:
    """
    Complete multi-step agent built with pure SDK + OpenRouter reasoning.
    """
    
    def __init__(self):
        self.tools = self._create_tools()
        self.agent_loop = AgentLoop(self.tools)
        self.memory = {"short_term": [], "long_term": []}
    
    def _create_tools(self) -> List[Tool]:
        """Create the available tools."""
        
        def search_tool(query: str) -> str:
            """Search for information."""
            knowledge = {
                "python": "Python is a versatile programming language created in 1991 by Guido van Rossum. It emphasizes code readability and supports multiple programming paradigms.",
                "agent": "An agent is an AI system that can reason, plan, and take actions to accomplish tasks autonomously.",
                "langchain": "LangChain is a popular framework for building LLM-powered applications with chains, agents, and tools.",
                "llamaindex": "LlamaIndex is a data framework for connecting LLMs with external data sources.",
                "nvidia": "NVIDIA is a technology company known for GPUs, AI computing, and the CUDA parallel computing platform.",
                "nim": "NVIDIA NIMs provides optimized inference microservices for deploying AI models at scale."
            }
            
            results = []
            for key, value in knowledge.items():
                if key in query.lower():
                    results.append(value)
            
            return " ".join(results) if results else f"Found general information about: {query}"
        
        def calculate_tool(expression: str) -> str:
            """Calculate a mathematical expression."""
            try:
                allowed = set("0123456789+-*/(). ")
                if all(c in allowed for c in expression):
                    result = eval(expression)
                    return f"Result: {result}"
                return "Error: Invalid characters in expression"
            except Exception as e:
                return f"Error: [e]"
        
        def time_tool(input: str = "") -> str:
            """Get current time."""
            return f"Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        return [
            Tool(name="search", description="Search for information on a topic", function=search_tool),
            Tool(name="calculate", description="Perform mathematical calculations", function=calculate_tool),
            Tool(name="time", description="Get current date and time", function=time_tool)
        ]
    
    def run(self, task: str) -> str:
        """Run the agent on a task."""
        self.memory["short_term"].append({
            "task": task,
            "timestamp": datetime.now().isoformat()
        })
        
        result = self.agent_loop.run(task)
        
        self.memory["short_term"].append({
            "result": result[:200],
            "timestamp": datetime.now().isoformat()
        })
        
        if len(self.memory["short_term"]) > 10:
            self.memory["long_term"].extend(self.memory["short_term"][:5])
            self.memory["short_term"] = self.memory["short_term"][-5:]
        
        return result
    
    def get_memory_status(self) -> Dict[str, int]:
        return {
            "short_term_count": len(self.memory["short_term"]),
            "long_term_count": len(self.memory["long_term"])
        }

def main():
    """Demonstrate the pure SDK agent."""
    print("Pure SDK Agent with OpenRouter")
    print("=" * 50)
    
    agent = PureSDKAgent()
    
    tasks = [
        "What is Python and why is it popular?",
        "Calculate 25 * 4 + 10",
        "What time is it now?"
    ]
    
    for task in tasks:
        print(f"\nTask: {task}")
        print("-" * 50)
        try:
            result = agent.run(task)
            print(f"\nFinal Result: {result}")
        except Exception as e:
            print(f"Error: {e}")
    
    print("\n" + "=" * 50)
    print("Memory Status:", agent.get_memory_status())

if __name__ == "__main__":
    main()
