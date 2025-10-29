from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, PlainTextResponse
from .detect import detect
from .cli import ingest

app = FastAPI()

@app.get('/healthz')
def healthz():
    return { 'ok': True }

@app.post('/detect')
async def do_detect(req: Request):
    data = await req.body()
    return JSONResponse(detect(data))

@app.post('/ingest')
async def do_ingest(req: Request):
    data = await req.body()
    # reuse CLI ingest to print NDJSON lines
    # here we simply return a JSON for brevity
    lines = []
    def capture(s: str):
        lines.append(s)
    ingest(data)
    return PlainTextResponse('\n'.join(lines), media_type='application/x-ndjson')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=3002)


