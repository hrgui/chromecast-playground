export function GET(request) {
  console.log("GET /api/beacon", request.body);
  return new Response(JSON.stringify({ timestamp: Date.now() }));
}

export function POST(request) {
  console.log("POST /api/beacon", request.body);
  return new Response(JSON.stringify({ timestamp: Date.now() }));
}
