/* app1.js by Veda Patil */ 
/* this file provides all the code to complete the first task
in node.js homework. */ 

const fs = require('fs'); 
const { MongoClient } = require('mongodb'); 

// reading csv into array of place objects 
    const raw = fs.readFileSync('zips.csv', 'utf-8'); 
    const lines = raw.trim().split('\n'); 

    const places = {}; 

    for (const line of lines) { 
        const [place, zip] = line.split(',').map(s => s.trim()); 
        if (!place || !zip) continue; 

        if (places[place]) { 

            places[place].zips.push(zip); 
            console.log(`Updated: ${place} - added zip code ${zip}`); 
        } else { 
            places[place] = { place, zips: [zip] }; 
            console.log(`Added: ${place} - zip code ${zip}`); 
        }
    }

    const placeArray = Object.values(places); 

// connecting to mongo

    async function upload() { 
        const uri = 'mongodb+srv://vedapatil_db_user:gomarafi439@cs120.2dzjyo7.mongodb.net/?appName=CS120'; 
        const client = new MongoClient(uri); 

        try { 
            await client.connect(); 
            console.log(`Connected to MongoDB`); 

            const db = client.db('zipcodes'); 
            const collection = db.collection('places'); 


            await collection.deleteMany({}); 
            console.log(`Cleared existing documents \n`); 

            const result = await collection.insertMany(placeArray); 
            console.log(`Inserted: ${result.insertedCount} documents into places collection`); 

        } finally { 
            await client.close(); 
        }
    }

    upload().catch(console.error); 