import express from 'express';
import { prisma } from './db.js';

const router = express.Router();

// --- USER & INIT ---
router.post('/init', async (req, res) => {
  try {
    const { telegramId, firstName, lastName, username, languageCode } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
    }

    const strTelegramId = String(telegramId);

    // Try to find user
    let user = await prisma.user.findUnique({ 
      where: { telegramId: strTelegramId },
      include: { 
        habits: { orderBy: { createdAt: 'desc' } }, 
        tasks: { where: { completed: false }, orderBy: { createdAt: 'desc' } }, 
        dailyPlans: { orderBy: { day: 'asc' } }
      }
    });

    // Create if not exists
    if (!user) {
      console.log(`Creating new user for Telegram ID: ${telegramId}`);
      user = await prisma.user.create({
        data: {
          telegramId: strTelegramId,
          name: [firstName, lastName].filter(Boolean).join(' '),
          language: languageCode === 'ru' ? 'ru' : (languageCode === 'en' ? 'en' : 'uz'),
        },
        include: { habits: true, tasks: true, dailyPlans: true }
      });

      // Add default habits for new user
      const defaultHabits = [
        { name: '10 bet kitob o‘qish', type: 'positive', icon: '📚', color: 'blue', targetValue: 10, unit: 'bet' },
        { name: 'Shakarsiz kun', type: 'negative', icon: '🍬', color: 'red' }
      ];

      for (const h of defaultHabits) {
        await prisma.habit.create({
          data: {
            userId: user.id,
            ...h
          }
        });
      }

      // Refetch with new habits
      user = await prisma.user.findUnique({ 
        where: { telegramId: strTelegramId },
        include: { habits: true, tasks: true, dailyPlans: true }
      });
    } else {
        // User exists, update info if needed
        user = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: [firstName, lastName].filter(Boolean).join(' '),
                language: languageCode === 'ru' ? 'ru' : (languageCode === 'en' ? 'en' : 'uz'),
            },
            include: { 
              habits: { orderBy: { createdAt: 'desc' } }, 
              tasks: { where: { completed: false }, orderBy: { createdAt: 'desc' } }, 
              dailyPlans: { orderBy: { day: 'asc' } }
            }
        });
    }

    // Return user with all necessary fields
    res.json({
      ...user,
      onboardingCompleted: user.onboardingCompleted,
      isPremium: user.isPremium
    });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- USER UPDATE ---
router.post('/user/onboarding', async (req, res) => {
  try {
    const { telegramId, onboardingCompleted } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
    }

    const user = await prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { onboardingCompleted: onboardingCompleted === true }
    });

    res.json({ success: true, onboardingCompleted: user.onboardingCompleted });
  } catch (error) {
    console.error('Onboarding update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- HABITS ---

// Create Habit
router.post('/habits', async (req, res) => {
  try {
    const { telegramId, ...habitData } = req.body;
    const user = await prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        name: habitData.name,
        type: habitData.type || 'positive',
        icon: habitData.icon,
        color: habitData.color,
        targetValue: habitData.targetValue,
        unit: habitData.unit,
        history: []
      }
    });
    res.json(habit);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Update Habit (Toggle, Edit)
router.put('/habits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // partial updates
    
    // Remove sensitive/readonly fields from updates
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;

    const habit = await prisma.habit.update({
      where: { id },
      data: updates
    });
    res.json(habit);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Delete Habit
router.delete('/habits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.habit.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// --- TASKS ---

// Add Task
router.post('/tasks', async (req, res) => {
  try {
    const { telegramId, title } = req.body;
    const user = await prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title,
        completed: false
      }
    });
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Toggle/Update Task
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const task = await prisma.task.update({
      where: { id },
      data: updates
    });
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Delete Task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// --- CHAT ---

// Save Message
router.post('/chat', async (req, res) => {
  try {
    const { telegramId, role, text, timestamp } = req.body;
    const user = await prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const message = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role,
        text,
        timestamp: new Date(timestamp || Date.now())
      }
    });
    res.json(message);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Get Chat History
router.get('/chat/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    const user = await prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const history = await prisma.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'asc' },
      take: 50 // Limit history
    });
    res.json(history);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// --- ADMIN ---

// Manual Migration Trigger (Emergency only)
router.get('/admin/migrate', async (req, res) => {
  const { telegramId } = req.query;
  const ADMIN_ID = '5928372261'; 
  
  if (String(telegramId) !== ADMIN_ID) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    console.log('🔄 Manual migration triggered...');
    // Try regular migrate first
    let result = await execAsync('npx prisma migrate deploy');
    
    // If it says "No pending migrations" but tables are missing, we need to push
    if (result.stdout.includes('No pending migrations')) {
       console.log('⚠️ Migration says done, but maybe tables missing. Trying db push...');
       result = await execAsync('npx prisma db push --accept-data-loss');
    }
    
    res.json({ 
      success: true, 
      output: result.stdout, 
      error: result.stderr 
    });
  } catch (e) {
    res.status(500).json({ error: String(e), stack: (e as Error).stack });
  }
});

// Admin Stats
router.get('/admin/stats', async (req, res) => {
  try {
    const { telegramId } = req.query;
    
    // Security Check (Hardcoded for MVP, ideally use ENV or DB role)
    const ADMIN_ID = '5928372261'; 
    if (String(telegramId) !== ADMIN_ID) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    // Aggregate Data
    const totalUsers = await prisma.user.count();
    
    // Active users today (users who updated habits or created tasks today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeHabits = await prisma.habit.count({
      where: { updatedAt: { gte: today } }
    });
    
    const totalHabits = await prisma.habit.count();
    const totalTasksCompleted = await prisma.task.count({ where: { completed: true } });

    // Recent Users List (Last 10)
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { habits: true }
        }
      }
    });

    const formattedUsers = recentUsers.map(u => ({
      id: u.id,
      telegramId: u.telegramId,
      name: u.name,
      createdAt: u.createdAt,
      habitsCount: u._count.habits
    }));

    res.json({
      totalUsers,
      activeUsersToday: activeHabits, // Proxy metric for now
      totalHabits,
      totalTasksCompleted,
      users: formattedUsers
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

export default router;

