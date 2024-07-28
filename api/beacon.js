function isRequestBodyValid(res) {
  const response = JSON.parse(res);
  const acceptableTypes = ["SHUTDOWN", "STARTUP"];
  return !isNaN(response.timestamp) && !isNaN(response.id) && acceptableTypes.includes(res.type);
}

export async function GET(request) {
  const res = await request.text();

  if (isRequestBodyValid(res)) {
    console.log("GET /api/beacon", res);
  }

  return new Response(JSON.stringify({ timestamp: Date.now() }));
}

export async function POST(request) {
  const res = await request.text();

  if (isRequestBodyValid(res)) {
    console.log("POST /api/beacon", res);
  }

  return new Response(JSON.stringify({ timestamp: Date.now() }));
}
