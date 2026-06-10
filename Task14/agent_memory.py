"""
Agent Memory System
Implements short-term and long-term memory for agents
"""

import json
import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import deque
import hashlib

@dataclass
class MemoryEntry:
    """A single memory entry."""
    content: str
    timestamp: datetime
    memory_type: str  # "short_term" or "long_term"
    metadata: Dict[str, Any] = field(default_factory=dict)
    importance: float = 0.5  # 0.0 to 1.0
    access_count: int = 0
    last_accessed: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage."""
        return {
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "memory_type": self.memory_type,
            "metadata": self.metadata,
            "importance": self.importance,
            "access_count": self.access_count,
            "last_accessed": self.last_accessed.isoformat() if self.last_accessed else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MemoryEntry":
        """Create from dictionary."""
        return cls(
            content=data["content"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            memory_type=data["memory_type"],
            metadata=data.get("metadata", {}),
            importance=data.get("importance", 0.5),
            access_count=data.get("access_count", 0),
            last_accessed=datetime.fromisoformat(data["last_accessed"]) if data.get("last_accessed") else None
        )

class ShortTermMemory:
    """
    Short-term memory - stores recent interactions.
    Limited capacity, FIFO eviction.
    """
    
    def __init__(self, capacity: int = 10):
        self.capacity = capacity
        self.entries: deque[MemoryEntry] = deque(maxlen=capacity)
    
    def add(self, content: str, metadata: Dict[str, Any] = None, importance: float = 0.5):
        """Add a new memory entry."""
        entry = MemoryEntry(
            content=content,
            timestamp=datetime.now(),
            memory_type="short_term",
            metadata=metadata or {},
            importance=importance
        )
        self.entries.append(entry)
        return entry
    
    def get_recent(self, n: int = 5) -> List[MemoryEntry]:
        """Get the n most recent memories."""
        return list(self.entries)[-n:]
    
    def search(self, query: str) -> List[MemoryEntry]:
        """Search short-term memory."""
        query_lower = query.lower()
        return [
            entry for entry in self.entries
            if query_lower in entry.content.lower()
        ]
    
    def clear(self):
        """Clear all short-term memory."""
        self.entries.clear()
    
    def get_context(self) -> str:
        """Get formatted context from short-term memory."""
        if not self.entries:
            return "No recent context."
        
        recent = self.get_recent(5)
        return "Recent context:\n" + "\n".join([
            f"- [{entry.timestamp.strftime('%H:%M')}] {entry.content[:100]}"
            for entry in recent
        ])

class LongTermMemory:
    """
    Long-term memory - stores important information permanently.
    Uses importance scoring and consolidation.
    """
    
    def __init__(self, storage_file: str = "long_term_memory.json"):
        self.storage_file = storage_file
        self.entries: List[MemoryEntry] = []
        self._load()
    
    def _load(self):
        """Load memory from file."""
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, 'r') as f:
                    data = json.load(f)
                    self.entries = [MemoryEntry.from_dict(entry) for entry in data]
            except Exception:
                self.entries = []
    
    def _save(self):
        """Save memory to file."""
        try:
            with open(self.storage_file, 'w') as f:
                json.dump([entry.to_dict() for entry in self.entries], f, indent=2)
        except Exception as e:
            print(f"Error saving memory: {e}")
    
    def add(self, content: str, metadata: Dict[str, Any] = None, importance: float = 0.7):
        """Add a new long-term memory."""
        # Check for duplicates
        content_hash = hashlib.md5(content.encode()).hexdigest()
        for entry in self.entries:
            if entry.metadata.get("hash") == content_hash:
                entry.access_count += 1
                entry.last_accessed = datetime.now()
                self._save()
                return entry
        
        entry = MemoryEntry(
            content=content,
            timestamp=datetime.now(),
            memory_type="long_term",
            metadata={**(metadata or {}), "hash": content_hash},
            importance=importance
        )
        self.entries.append(entry)
        self._save()
        return entry
    
    def search(self, query: str, limit: int = 5) -> List[MemoryEntry]:
        """Search long-term memory by relevance."""
        query_lower = query.lower()
        results = []
        
        for entry in self.entries:
            # Simple relevance scoring
            score = 0
            if query_lower in entry.content.lower():
                score += 1.0
            if any(word in entry.content.lower() for word in query_lower.split()):
                score += 0.5
            
            # Boost by importance and recency
            score *= entry.importance
            if entry.last_accessed:
                days_since = (datetime.now() - entry.last_accessed).days
                score *= max(0.1, 1.0 - (days_since / 30))
            
            if score > 0:
                results.append((score, entry))
        
        # Sort by score and return top results
        results.sort(key=lambda x: x[0], reverse=True)
        return [entry for _, entry in results[:limit]]
    
    def get_important(self, min_importance: float = 0.7) -> List[MemoryEntry]:
        """Get memories above importance threshold."""
        return [
            entry for entry in self.entries
            if entry.importance >= min_importance
        ]
    
    def consolidate(self, short_term: ShortTermMemory):
        """Consolidate important short-term memories to long-term."""
        for entry in short_term.entries:
            if entry.importance >= 0.7 or entry.access_count >= 3:
                self.add(
                    content=entry.content,
                    metadata=entry.metadata,
                    importance=entry.importance
                )
        short_term.clear()
    
    def get_context(self, query: str = "") -> str:
        """Get formatted context from long-term memory."""
        if not self.entries:
            return "No long-term memories stored."
        
        if query:
            relevant = self.search(query, limit=3)
            if relevant:
                return "Relevant memories:\n" + "\n".join([
                    f"- {entry.content[:150]}"
                    for entry in relevant
                ])
        
        important = self.get_important(min_importance=0.8)
        if important:
            return "Important memories:\n" + "\n".join([
                f"- {entry.content[:150]}"
                for entry in important[:3]
            ])
        
        return f"Total memories stored: {len(self.entries)}"

class AgentMemorySystem:
    """
    Complete memory system combining short-term and long-term memory.
    """
    
    def __init__(self, short_term_capacity: int = 10, storage_file: str = "agent_memory.json"):
        self.short_term = ShortTermMemory(capacity=short_term_capacity)
        self.long_term = LongTermMemory(storage_file=storage_file)
        self.interaction_count = 0
    
    def remember(self, content: str, importance: float = 0.5, metadata: Dict[str, Any] = None):
        """Store a new memory."""
        self.short_term.add(content, metadata, importance)
        self.interaction_count += 1
        
        # Auto-consolidate every 10 interactions
        if self.interaction_count % 10 == 0:
            self.long_term.consolidate(self.short_term)
    
    def recall(self, query: str) -> str:
        """Recall relevant memories."""
        short_term_results = self.short_term.search(query)
        long_term_results = self.long_term.search(query)
        
        context_parts = []
        
        if short_term_results:
            context_parts.append("Recent context:")
            for entry in short_term_results[:3]:
                context_parts.append(f"- {entry.content[:100]}")
        
        if long_term_results:
            context_parts.append("Relevant memories:")
            for entry in long_term_results[:3]:
                context_parts.append(f"- {entry.content[:100]}")
        
        return "\n".join(context_parts) if context_parts else "No relevant memories found."
    
    def get_full_context(self) -> str:
        """Get full context from both memory systems."""
        return f"{self.short_term.get_context()}\n\n{self.long_term.get_context()}"
    
    def save(self):
        """Save all memories."""
        self.long_term._save()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get memory statistics."""
        return {
            "short_term_count": len(self.short_term.entries),
            "short_term_capacity": self.short_term.capacity,
            "long_term_count": len(self.long_term.entries),
            "total_interactions": self.interaction_count
        }

def main():
    """Demonstrate the memory system."""
    print("Agent Memory System Demo")
    print("="*50)
    
    memory = AgentMemorySystem()
    
    # Simulate some interactions
    interactions = [
        ("User asked about Python programming", 0.6),
        ("User calculated 2 + 2 = 4", 0.4),
        ("User learned about LangChain framework", 0.8),
        ("User asked about agent architectures", 0.9),
        ("User is building a multi-step agent", 0.7)
    ]
    
    for content, importance in interactions:
        memory.remember(content, importance)
        print(f"Stored: {content[:50]}... (importance: {importance})")
    
    # Recall some memories
    print("\n" + "="*50)
    print("Recalling 'Python':")
    print(memory.recall("Python"))
    
    print("\nRecalling 'agent':")
    print(memory.recall("agent"))
    
    # Show stats
    print("\n" + "="*50)
    print("Memory Stats:", memory.get_stats())

if __name__ == "__main__":
    main()
