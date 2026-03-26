import "dotenv/config";

const apiKey = process.env.TINYFISH_API_KEY;

if (!apiKey) {
    throw new Error("Missing TINYFISH_API_KEY in .env");
}

async function main() {
    const response = await fetch("https://agent.tinyfish.ai/v1/automation/run", {
        method: "POST",
        headers: {
            "X-API-Key": apiKey as string,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url: "https://scrapeme.live/shop",
            goal: "Extract the first 2 product names and prices. Return clean JSON.",
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("TinyFish error:", data);
        throw new Error(`Request failed with status ${response.status}`);
    }

    console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});