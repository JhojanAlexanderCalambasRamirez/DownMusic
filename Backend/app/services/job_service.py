import uuid
from dataclasses import dataclass, field
from threading import Lock

@dataclass
class Job:
    id: str
    total: int = 0
    completed: int = 0
    status: str = "processing"   # processing | done | error
    failed: list[str] = field(default_factory=list)
    zip_path: str | None = None
    zip_name: str | None = None
    error: str | None = None

_store: dict[str, Job] = {}
_lock = Lock()


def create_job(total: int) -> Job:
    job = Job(id=str(uuid.uuid4()), total=total)
    with _lock:
        _store[job.id] = job
    return job


def get_job(job_id: str) -> Job | None:
    return _store.get(job_id)


def remove_job(job_id: str):
    with _lock:
        _store.pop(job_id, None)
