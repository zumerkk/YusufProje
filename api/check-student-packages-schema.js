const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  try {
    // Try to insert with both column names to see which one works
    const testData = {
      student_id: 'c419564f-ce0a-4380-aad7-e06cbc559455',
      package_id: 'a1b2c3d4-e5f6-7890-abcd-123456789012',
      status: 'active',
      start_date: new Date().toISOString(),
      purchase_date: new Date().toISOString(),
      remaining_lessons: 320,
      total_lessons: 320
    };

    // Test with end_date
    const testWithEndDate = { ...testData, end_date: new Date().toISOString() };
    const { data: data1, error: error1 } = await supabase
      .from('student_packages')
      .insert(testWithEndDate)
      .select();
    
    if (!error1) {
      console.log('✅ Table uses "end_date" column');
      // Clean up test data
      if (data1 && data1[0]) {
        await supabase.from('student_packages').delete().eq('id', data1[0].id);
      }
    } else if (error1.message.includes('expiry_date')) {
      console.log('❌ Table expects "expiry_date" but we provided "end_date"');
      
      // Test with expiry_date
      const testWithExpiryDate = { ...testData, expiry_date: new Date().toISOString() };
      const { data: data2, error: error2 } = await supabase
        .from('student_packages')
        .insert(testWithExpiryDate)
        .select();
      
      if (!error2) {
        console.log('✅ Table uses "expiry_date" column');
        // Clean up test data
        if (data2 && data2[0]) {
          await supabase.from('student_packages').delete().eq('id', data2[0].id);
        }
      } else {
        console.log('Error with expiry_date:', error2.message);
      }
    } else {
      console.log('Error with end_date:', error1.message);
    }

  } catch (err) {
    console.log('Error:', err);
  }
  process.exit(0);
}

checkSchema();
