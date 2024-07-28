export async function GET(request) {
  const res = await request.text();
  console.log("GET /api/beacon", res);
  return new Response(JSON.stringify({ timestamp: Date.now() }));
}

export async function POST(request) {
  const res = await request.text();
  console.log("POST /api/beacon", res);
  return new Response(JSON.stringify({ timestamp: Date.now() }));
}
