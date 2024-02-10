Hono&D1 create bulletin board
**api only**
## Setup
```
bun i
bun run db // This is not windows support
// windows
bun run dbg
bun run dbm
```
## Endpoint
- /api/threads(view any threads(limit 10))GET
- /api/threads/:threadid(view res on :threadid)GET
- /api/post/:threadid(post res in :threadid)POST
JSON Body
```json
 {
        "id": "threadID",
        "name": "name",
        "mail": "optional if non this delete",
        "message": "message",
        "ip_addr": "ip_address(ex localhost,192.168.0.1)"
}
```
- /api/newThread(create new thread)POST
JSON Body
```json
{
        "title":"threadtitle",
        "name":"name",
        "mail":"optional if non this delete",
        "message":"message",
        "ip_addr":"ip_address(ex localhost,192.168.0.1)"
}
```
