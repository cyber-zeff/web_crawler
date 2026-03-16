import urllib.robotparser
import aiohttp
import asyncio
from urllib.parse import urlparse

_cache: dict[str, urllib.robotparser.RobotFileParser] = {}

async def fetch_robots(base_url: str) -> urllib.robotparser.RobotFileParser:
    parsed = urlparse(base_url)
    root = f"{parsed.scheme}://{parsed.netloc}"

    if root in _cache:
        return _cache[root]

    rp = urllib.robotparser.RobotFileParser()
    robots_url = f"{root}/robots.txt"
    rp.set_url(robots_url)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(robots_url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                if resp.status == 200:
                    text = await resp.text()
                    rp.parse(text.splitlines())
                else:
                    rp.parse([])  # no robots.txt = allow all
    except Exception:
        rp.parse([])  # on error = allow all

    _cache[root] = rp
    return rp

async def is_allowed(url: str, user_agent: str = "*") -> bool:
    try:
        rp = await fetch_robots(url)
        return rp.can_fetch(user_agent, url)
    except Exception:
        return True  # fail open