import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const wishes = await kv.get('birthday:wishes') || [];
        const guestbook = await kv.get('birthday:guestbook') || [];
        const photos = await kv.get('birthday:photos') || [];
        
        res.status(200).json({
            success: true,
            stats: {
                totalWishes: wishes.length,
                totalGuestbookEntries: guestbook.length,
                totalPhotos: photos.length,
                totalLikes: photos.reduce((sum, p) => sum + (p.likes || 0), 0)
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
