import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            // Get all wishes
            const wishes = await kv.get('birthday:wishes') || [];
            
            res.status(200).json({
                success: true,
                count: wishes.length,
                wishes: wishes
            });
        } 
        else if (req.method === 'POST') {
            // Add a new wish
            const { name, message } = req.body;
            
            if (!name || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'Name and message are required'
                });
            }
            
            const wish = {
                id: Date.now(),
                name: name.trim(),
                message: message.trim(),
                timestamp: new Date().toISOString()
            };
            
            // Get existing wishes
            const wishes = await kv.get('birthday:wishes') || [];
            wishes.push(wish);
            
            // Save back to KV
            await kv.set('birthday:wishes', wishes);
            
            res.status(201).json({
                success: true,
                wish: wish,
                message: 'Wish added successfully'
            });
        }
        else if (req.method === 'DELETE') {
            // Delete a wish (admin feature)
            const id = parseInt(req.query.id);
            
            const wishes = await kv.get('birthday:wishes') || [];
            const index = wishes.findIndex(w => w.id === id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    error: 'Wish not found'
                });
            }
            
            wishes.splice(index, 1);
            await kv.set('birthday:wishes', wishes);
            
            res.status(200).json({
                success: true,
                message: 'Wish deleted successfully'
            });
        }
        else {
            res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
