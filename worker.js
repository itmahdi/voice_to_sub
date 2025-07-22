export default {
  async fetch(request, env, ctx) {
    // هدرهای لازم برای ارتباط بین دامنه‌ها (CORS)
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    //
    // ⬇️⬇️⬇️ مهم: این آدرس را با آدرس API خودت در Hugging Face جایگزین کن ⬇️⬇️⬇️
    //
    const HUGGING_FACE_API_URL = 'https://mahdine0-subtitle.hf.space/run/predict';

    try {
      // فایل صوتی را به صورت یک رشته کدگذاری شده (Base64) در می‌آوریم
      const audioBlob = await request.blob();
      const base64Audio = await blobToBase64(audioBlob);

      // فرمت درخواستی که Hugging Face انتظار دارد
      const apiPayload = {
        data: [
          base64Audio 
        ]
      };

      // ارسال درخواست به Hugging Face
      const apiResponse = await fetch(HUGGING_FACE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        console.error('Hugging Face API Error:', errorBody);
        throw new Error('خطا از سمت Hugging Face. ممکن است Space شما در حال ساخت یا خاموش باشد.');
      }

      // دریافت و ارسال نتیجه نهایی به سایت
      const responseData = await apiResponse.json();
      const srtContent = responseData.data[0];

      headers.set('Content-Type', 'text/plain');
      return new Response(srtContent, { headers });

    } catch (error) {
      console.error('Worker Error:', error);
      return new Response(JSON.stringify({ error: `خطای داخلی Worker: ${error.message}` }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
  },
};

// تابع کمکی برای تبدیل فایل به رشته Base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
