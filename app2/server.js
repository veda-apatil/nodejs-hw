/* server.js by Veda Patil for node.js homework assignment */ 

const http = require('http'); 
const { MongoClient } = require('mongodb'); 


const uri = 'mongodb+srv://vedapatil_db_user:gomarafi439@cs120.2dzjyo7.mongodb.net/?appName=CS120'; 
const client = new MongoClient(uri); 


async function getCollection() { 
    if (!client.topology?.isConnected()) await client.connect(); 
    return client.db('zipcodes').collection('places'); 
}

function getBody(req) { 
    return new Promise((resolve) => { 
        let body = ''; 
        req.on('data', chunk => body += chunk); 
        req.on('end', () => resolve(body)); 
    }); 
}

function parseForm(body) { 
    const params = new URLSearchParams(body); 
    return params.get('query'); 
}

const server = http.createServer(async (req, res) => { 

    // home view
    if (req.method === 'GET' && req.url === '/') { 
        res.writeHead(200, { 'Content-Type': 'text/html' }); 
        res.end(`
            <!DOCTYPE html> 
            <html> 
            <head><title>MA Zip Lookup</title></head> 
            <body> 
                <h1>Massachusetts Zip Code Lookup</h1> 
                <p>Enter a place name or zip code here: </p> 
                <form action="/process" method="POST"> 
                    <input type="text" name="query" placeholder="Place or zip code" required> 
                    <button type="submit">Search</button> 
                </form> 
            </body> 
        </html>
        `); 
    } else if (req.method === 'POST' && req.url === '/process') { 
        const body = await getBody(req); 
        const query = parseForm(body)?.trim(); 

        if (!query) { 
            res.writeHead(302, { Location: '/'}); 
            res.end(); 
            return; 
        }

        const collection = await getCollection(); 
        const isZip = /^\d/.test(query); 
        let result = null; 

        if (isZip) { 
            result = await collection.findOne({ zips: query }); 
        } else { 
            result = await collection.findOne({
                place: { $regex: new RegExp(`^${query}$`, 'i') }
            }); 
        }

        if (result) { 
            console.log(`\nsearch: "${query}"`); 
            console.log(`Place: ${result.place}`); 
            console.log(`Zip codes: ${result.zips.join(', ')}`); 

        } else { 
            console.log(`\nSearch: "${query}" - no results found`); 
        }

        // sending response to browser 
        res.writeHead(200, { 'Content-Type': 'text/html' }); 
        res.end(`
            <!DOCTYPE html> 
            <html> 
            <head><title>Search Result</title></head>
            <body> 
                <h1>Results for "${query}"</h1>
                ${result ? `
                    <p><strong>Place:</strong> ${result.place}</p>
                    <p><strong>Zip code${result.zips.length > 1 ? 's' : ''}:</strong> ${result.zips.join(', ')}</p>
                    ` : `
                        <p>No results found for "${query}".</p>
                    `}
                    <br> 
                    <a href="/">Search again</a> 
                </body> 
                </html> 
            `); 

                } else { 
                res.writeHead(404); 
                res.end('Not Found');
            }
        }); 

const PORT = process.env.PORT || 3000; 
server.listen(PORT, () => { 
    console.log(`App 2 running on port ${PORT}`); 
}); 

