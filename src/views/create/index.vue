<script setup lang="ts">

</script>

<template>
  <div class="create-container">
    <h1>创作中心</h1>
    <div class="create-content">
      <div class="create-tools">
        <el-button type="primary" size="large">新建项目</el-button>
      </div>
      <div class="project-list">
        <h2>我的项目</h2>
        <div class="empty-state">
          <el-empty description="暂无项目"></el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-container {
  padding: 20px;
}

.create-content {
  margin-top: 20px;
}

.create-tools {
  margin-bottom: 30px;
}

.project-list {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
}

.project-list h2 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #18191c;
}

.empty-state {
  padding: 40px 0;
}
</style>