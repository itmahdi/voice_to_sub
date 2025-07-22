document.addEventListener('DOMContentLoaded', () => {
    const audioFileInput = document.getElementById('audioFile');
    const generateBtn = document.getElementById('generateBtn');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');

    // آدرس تغییر نمی‌کند و همچنان ریشه اصلی است
    const WORKER_URL = '/';

    generateBtn.addEventListener('click', async () => {
        const file = audioFileInput.files[0];
        if (!file) {
            updateStatus('لطفاً یک فایل صوتی انتخاب کنید.', 'red');
            return;
        }

        generateBtn.disabled = true;
        downloadLink.style.display = 'none';
        updateStatus('در حال آپلود و پردازش... (این فرآیند ممکن است چند دقیقه طول بکشد)', '#ccc');

        try {
            // فایل صوتی را مستقیماً به دامنه اصلی ارسال می‌کنیم
            // اتصال مستقیم ورکر که در تنظیمات انجام دادی، این درخواست را مدیریت می‌کند
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': file.type,
                },
                body: file,
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || 'خطایی در پردازش رخ داد.');
            }

            const srtContent = await response.text();
            if (!srtContent) {
                throw new Error('زیرنویس خالی است. ممکن است گفتاری تشخیص داده نشده باشد.');
            }
            
            const blob = new Blob([srtContent], { type: 'text/srt' });
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.style.display = 'block';
            updateStatus('✅ زیرنویس با موفقیت ساخته شد!', '#42b72a');

        } catch (error) {
            console.error('Frontend Error:', error);
            updateStatus(`خطا: ${error.message}`, 'red');
        } finally {
            generateBtn.disabled = false;
        }
    });

    function updateStatus(message, color) {
        statusDiv.textContent = message;
        statusDiv.style.color = color;
    }
});
