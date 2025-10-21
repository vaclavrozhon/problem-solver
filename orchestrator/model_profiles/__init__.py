"""
Model profiles and registry.

Each model has a dedicated file exporting a `profile` object. The registry below
collects them and provides simple lookup helpers so the rest of the code can be
model-agnostic.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Dict


@dataclass(frozen=True)
class ModelProfile:
    id: str
    display_name: str
    is_reasoning: bool
    input_cost_per_1k: Optional[float] = None
    output_cost_per_1k: Optional[float] = None


# Import individual profiles (keep imports local to avoid hard failures)
_registry: Dict[str, ModelProfile] = {}

try:
    from .gpt5 import profile as _gpt5
    _registry[_gpt5.id] = _gpt5
except Exception:
    pass

try:
    from .gpt5mini import profile as _gpt5mini
    _registry[_gpt5mini.id] = _gpt5mini
except Exception:
    pass

try:
    from .gpt4 import profile as _gpt4
    _registry[_gpt4.id] = _gpt4
except Exception:
    pass


def get_model_profile(model_id: str) -> Optional[ModelProfile]:
    mid = (model_id or "").strip()
    if not mid:
        return None
    # normalize to lower-case id for lookup
    return _registry.get(mid)


def is_reasoning_model(model_id: str) -> bool:
    p = get_model_profile(model_id)
    if p is None:
        raise ValueError(f"Unknown model id for reasoning determination: '{model_id}'")
    return p.is_reasoning


__all__ = ["ModelProfile", "get_model_profile", "is_reasoning_model"]


