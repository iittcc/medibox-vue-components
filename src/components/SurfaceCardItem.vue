<template>
  <div class="flex flex-row w-full">
    <div class="flex items-center justify-start w-1/12 m-2">
      <slot name="icon" />
    </div>
    <div class="flex items-center justify-start w-4/12 m-2 font-medium">
      <slot name="title" />
    </div>
    <div class="flex items-center m-2">
      <slot name="content" />
    </div>
  </div>
</template>
