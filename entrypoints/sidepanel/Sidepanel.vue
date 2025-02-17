<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner';
import { ref, onMounted, onBeforeUnmount } from 'vue';
// @ts-ignore
import { processImage } from '@/utils/processImage';
// @ts-ignore
import { handleImageCopy } from '@/utils/CopyImage';
// import { toast, Toaster } from 'sonner';
// import Zoom from 'react-medium-image-zoom';
// import 'react-medium-image-zoom/dist/styles.css';

const imageSrc = ref<string | null>(null);
const originalName = ref(`${Date.now()}图片.png`);
const uploadRef = ref<HTMLInputElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref<number>(0);

const updateCanvas = async (file: File) => {
  const reader = new FileReader();
  reader.onload = async (e: ProgressEvent<FileReader>) => {
    const base64 = e.target?.result as string;
    const newBase64 = await processImage(canvasRef.value, base64);
    imageSrc.value = newBase64;
  };
  reader.readAsDataURL(file);
};

const beforeUpload = async (file: File) => {
  if (!file) return;
  updateCanvas(file);
  originalName.value = file.name;
};

const handlePaste = async (event: ClipboardEvent) => {
  const clipboardItems = event.clipboardData?.items;
  if (clipboardItems) {
    // @ts-ignore
    for (const item of clipboardItems) {
      if (item.type.startsWith('image/png')) {
        const file = item.getAsFile();
        if (file) {
          updateCanvas(file);
        }
      }
    }
  }
};

onMounted(() => {
  canvasWidth.value = window.innerWidth * 0.7;
  window.addEventListener('paste', handlePaste);
});

onBeforeUnmount(() => {
  window.removeEventListener('paste', handlePaste);
});

const triggerUpload = () => {
  uploadRef.value?.click();
};

const handleDownload = () => {
  const a = document.createElement('a');
  a.href = imageSrc.value as string;
  a.download = originalName.value;
  a.click();
};
</script>

<template>
  <div class="mt-5">
    <h2 class="text-center text-lg font-bold">图片处理</h2>

    <div
      class="w-full min-w-[250px] max-w-md mx-auto mt-4 border border-dashed border-gray-300 p-4 rounded-lg">
      <input
        type="file"
        accept=".png"
        class="hidden"
        ref="uploadRef"
        @change="beforeUpload($event.target.files[0])" />

      <div
        class="flex flex-col items-center cursor-pointer"
        @click="triggerUpload">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          class="text-gray-500">
          <path
            fill="currentColor"
            d="M16 4c-4.12 0-7.36 3.13-7.813 7.125a4.9 4.9 0 0 0-3.843 3.22C1.884 15.054 0 17.248 0 20c0 3.324 2.676 6 6 6h20c3.324 0 6-2.676 6-6c0-1.76-.855-3.336-2.094-4.438c-.232-3.514-3.035-6.318-6.562-6.5C22.14 6.133 19.378 4 16 4m0 2c2.762 0 4.97 1.77 5.75 4.28l.22.72H23c2.755 0 5 2.245 5 5v.5l.406.313A4.07 4.07 0 0 1 30 20c0 2.276-1.724 4-4 4H6c-2.276 0-4-1.724-4-4c0-2.02 1.45-3.588 3.28-3.906l.657-.125l.125-.658C6.362 13.964 7.556 13 9 13h1v-1c0-3.37 2.63-6 6-6m0 5.594l-.72.687l-4 4l1.44 1.44L15 15.437V22h2v-6.563l2.28 2.282l1.44-1.44l-4-4z" />
        </svg>
        <div class="text-sm text-gray-500 mt-2">拖动/粘贴/点击上传图片</div>
      </div>
    </div>

    <canvas
      ref="canvasRef"
      hidden />
    <div
      v-if="imageSrc"
      class="text-center mt-4 mx-auto p-8">
      <img
        :src="imageSrc"
        alt=""
        class="rounded-lg max-h-80 mx-auto" />
      <div class="mt-4">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          @click="handleImageCopy(imageSrc)">
          复制图片
        </button>
        <button
          class="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          @click="handleDownload">
          下载图片
        </button>
      </div>
    </div>
    <Toaster />
  </div>
</template>
