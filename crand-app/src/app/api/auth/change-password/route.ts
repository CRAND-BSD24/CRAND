import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  console.log('🔐 [DEBUG] Password change request received');
  let client;
  
  try {
    const session = await getServerSession(authOptions);
    console.log('🔐 [DEBUG] Session data:', { 
      email: session?.user?.email,
      hasSession: !!session 
    });
    
    if (!session?.user?.email) {
      console.log('❌ [DEBUG] Unauthorized: No session or email found');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();
    console.log('🔐 [DEBUG] Request body:', { 
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword,
      newPasswordLength: newPassword?.length 
    });

    if (!currentPassword || !newPassword) {
      console.log('❌ [DEBUG] Missing required fields');
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    console.log('🔐 [DEBUG] Connecting to MongoDB...');
    client = await MongoClient.connect(process.env.MONGODB_CONNECTION_STRING!);
    console.log('✅ [DEBUG] MongoDB connected successfully');

    const db = client.db('pesantren_db');
    // Use 'User' collection instead of 'users' as MongoDB typically uses singular form
    const usersCollection = db.collection('users');

    // Log available collections for debugging
    console.log('🔐 [DEBUG] Available collections:', await db.listCollections().toArray());

    // Find user by email with case-insensitive search
    console.log('🔐 [DEBUG] Searching for user:', session.user.email);
    const user = await usersCollection.findOne({
      email: session.user.email.toLowerCase()
    });
    
    // Log the full user object for debugging (excluding sensitive data)
    console.log('🔐 [DEBUG] User search result:', { 
      found: !!user,
      userId: user?._id,
      userEmail: user?.email,
      collections: await db.listCollections().toArray()
    });

    if (!user) {
      console.log('❌ [DEBUG] User not found in database');
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    console.log('🔐 [DEBUG] Verifying current password...');
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    console.log('🔐 [DEBUG] Password verification result:', { isValid: isPasswordValid });

    if (!isPasswordValid) {
      console.log('❌ [DEBUG] Current password verification failed');
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    console.log('🔐 [DEBUG] Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ [DEBUG] New password hashed successfully');

    // Update password
    console.log('🔐 [DEBUG] Updating password in database...');
    const updateResult = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    console.log('🔐 [DEBUG] Update result:', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount
    });

    console.log('✅ [DEBUG] Password change completed successfully');

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ [DEBUG] Error changing password:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
      console.log('🔐 [DEBUG] MongoDB connection closed');
    }
  }
} 