<!-- 用户管理 -->
<template>
  <NuxtLayout name="root">
    <v-container max-width="sm">
      <!-- 标题 -->
      <v-row class="pt-2">
        <v-col cols="6">
          <h1 class="text-primary font-weight-bold">用户管理</h1>
        </v-col>
      </v-row>

      <!-- 内容 -->
      <v-row>
        <v-col cols="12">
          <v-card class="pa-4">
            <!-- 表格头部 -->
            <v-row>
              <!-- 工具栏 -->
              <v-col cols="4" md="8" class="d-flex align-center">
                <!-- <v-btn color="accent" variant="flat"> 添加用户 </v-btn> -->
              </v-col>
              <!-- 搜索栏 -->
              <v-col cols="8" md="4" class="d-flex justify-end">
                <v-btn elevation="0" icon="mdi-filter" size="small" variant="text"
                  @click="openSearchUserDialog()"></v-btn>
                <v-text-field color="accent" append-inner-icon="mdi-magnify" density="compact" label="搜索"
                  variant="outlined" v-model="tableSearchValue" @input="searchTableData" hide-details
                  single-line></v-text-field>
              </v-col>
            </v-row>

            <!-- 表格身体 -->
            <v-row>
              <v-col cols="12">
                <v-card variant="outlined" color="#E0E0E0">
                  <v-data-table :style="{ 'white-space': 'nowrap' }" :headers="TableHeaders" :items="tableItems"
                    :items-per-page="tableListRows" item-value="id" v-model="tableSelected" show-select>
                    <!-- 头部选择框 -->
                    <template v-slot:header.data-table-select="{
                      allSelected,
                      selectAll,
                      someSelected,
                    }">
                      <v-checkbox-btn :indeterminate="someSelected && !allSelected" :model-value="allSelected"
                        color="accent" @update:model-value="selectAll(!allSelected)"></v-checkbox-btn>
                    </template>

                    <!-- 内容选择框 -->
                    <template v-slot:item.data-table-select="{
                      internalItem,
                      isSelected,
                      toggleSelect,
                    }">
                      <v-checkbox-btn :model-value="isSelected(internalItem)" color="accent"
                        @update:model-value="toggleSelect(internalItem)"></v-checkbox-btn>
                    </template>

                    <!-- 权限 -->
                    <template v-slot:[`item.roles_id`]="{ item }">
                      <v-chip size="x-small" v-for="(role, index) in renderUserRoles(item.roles_id)" :key="index">
                        {{ role }}
                      </v-chip>
                    </template>

                    <!-- 头像 -->
                    <template v-slot:[`item.avatar`]="{ item }">
                      <v-avatar>
                        <v-img :alt="item.username" :src="item.avatar"></v-img>
                      </v-avatar>
                    </template>

                    <!-- 操作 -->
                    <template v-slot:[`item.operate`]="{ item }">
                      <v-btn icon="mdi-pencil" elevation="0" size="small" color="accent" variant="text"
                        @click="openEditUserDialog(item)"></v-btn>
                      <v-btn icon="mdi-delete" elevation="0" size="small" color="accent" variant="text"
                        @click="openDeleteUserDialog(item)"></v-btn>
                    </template>

                    <!-- 账号状态 -->
                    <template v-slot:[`item.status`]="{ item }">
                      <v-chip :color="item.status === 0
                        ? 'success'
                        : item.status === -1
                          ? 'error'
                          : 'warning'
                        " variant="flat" size="small">
                        {{
                          SelectUtils.User.status.find(
                            (state) => state.value === item.status
                          )?.title
                        }}
                      </v-chip>
                    </template>

                    <!-- 无结果时的显示内容 -->
                    <template v-slot:no-data>
                      没有找到相关数据
                    </template>
                    <template v-slot:bottom>
                      <!-- 隐藏默认分页器 -->
                    </template>
                  </v-data-table>
                </v-card>
              </v-col>
            </v-row>

            <!-- 表格脚部 -->
            <v-row>
              <!-- 批量操作 -->
              <v-col cols="12" md="6" class="d-flex justify-start align-center">
                <v-select density="compact" label="请选择操作" max-width="160px" hide-details variant="outlined"
                  color="accent" :items="TableBatchOptions" item-title="title" item-value="value"
                  v-model="BatchUserBtnStatus"></v-select>
                <v-btn color="accent" variant="flat" class="ml-2" @click="openBatchUserDialog"
                  :disabled="tableSelected.length === 0">批量操作</v-btn>
              </v-col>
              <!-- 分页按钮 -->
              <v-col cols="12" md="6" class="d-flex justify-end align-center">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn elevation="0" icon="mdi-table-cog" size="small" v-bind="props" variant="text"></v-btn>
                  </template>
                  <v-list>
                    <v-list-item v-for="(item, index) in TableListRowsOptions" :key="index" :value="index">
                      <v-list-item-title @click="tableListRows = item.value">{{
                        item.title
                        }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-divider vertical></v-divider>
                <!-- <v-select density="compact" label="行/页" max-width="80px" hide-details variant="outlined" color="accent"
									:items="TableListRowsOptions" v-model="tableListRows"></v-select> -->
                <v-pagination v-model="tableCurrentPage" :length="tablePaginationLength" :total-visible="5"
                  color="accent" size="small" variant="elevated"></v-pagination>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>

  <!-- 编辑用户对话框 -->
  <EditUserDialog v-model:thisDialogState="EditUserDialog_state" v-model:editUserData="EditUserDialog_data"
    :getTableData="getTableData" :ACCOUNT_STATUS="SelectUtils.User.status" :USER_ROLES="UserRoles"></EditUserDialog>
  <!-- 删除用户对话框 -->
  <DeleteUserDialog v-model:thisDialogState="DeleteUserDialog_state" v-model:delUserData="DeleteUserDialog_data"
    :getTableData="getTableData"></DeleteUserDialog>
  <!-- 批量处理用户对话框 -->
  <BatchUserDialog v-model:thisDialogState="BatchUserDialog_state" v-model:batchUserData="tableSelected"
    :getTableData="getTableData"></BatchUserDialog>
  <!-- 搜索用户对话框 -->
  <SearchUserDialog v-model:thisDialogState="SearchUserDialog_state" :KEYS="SearchKeys"
    :setFilter="setTableSearchFilter" :getTableData="getTableData"></SearchUserDialog>
</template>

<script setup lang="ts">
import UsersApi from "@/api/app/users";
import CommonUtils from "@/api/utils/common";
import ApiMonitor from "@/api/interceptors/monitor";
import DeleteUserDialog from "~/components/users/DeleteUserDialog.vue";
import EditUserDialog from "~/components/users/EditUserDialog.vue";
import BatchUserDialog from "~/components/users/BatchUserDialog.vue";
import SearchUserDialog from "~/components/users/SearchUserDialog.vue";
import SelectUtils from "~/api/utils/select";

const notifier = useNotifier();

//表格头部
const TableHeaders = [
  { title: "ID", value: "id" },
  { title: "权限组", value: "roles_id" },
  { title: "头像", value: "avatar" },
  { title: "账号", value: "number" },
  { title: "用户名", value: "username" },
  { title: "邮箱", value: "email" },
  { title: "手机号", value: "phone" },
  { title: "注册时间", value: "created_at" },
  { title: "状态", value: "status" },
  { title: "操作", value: "operate" },
];
//搜索字段
const SearchKeys = [...TableHeaders];
SearchKeys.pop();
//批量操作选项
const TableBatchOptions = [
  // { title: '封禁/解封', value: 'delete' },
  { title: "删除", value: "disable" },
  // { title: '启用', value: 'enable' },
];
//每一页项目数量
const TableListRowsOptions = [
  { title: "10 / 页", value: 10 },
  { title: "20 / 页", value: 20 },
  { title: "50 / 页", value: 50 },
  { title: "100 / 页", value: 100 },
];
//用户组
const UserRoles = [
  { title: "#0 超级管理员", value: 0 },
  { title: "#1 管理员", value: 1 },
  { title: "#2 用户", value: 2 },
];
//渲染用户标签数据预处理
const renderUserRoles = (roles_id: any) => {
  if (roles_id != null) {
    roles_id = JSON.parse(roles_id);
    let roles_title: string[] = [];
    if (typeof roles_id === "number") {
      const roles = UserRoles.find((role) => role.value === roles_id);
      if (roles) {
        return roles.title;
      }
    } else {
      roles_id.forEach((item: any) => {
        const roles = UserRoles.find((role) => role.value === item);
        if (roles) {
          roles_title.push(roles.title);
        }
      });
    }
    return roles_title;
  } else {
    return [];
  }
};

//表格数据
const tableItems = ref([{} as any]);
//批量选择数据
const tableSelected = ref([]);
//页面数量
const tablePaginationLength = ref(0);
//当前页面
const tableCurrentPage = ref(1);
//搜索值
const tableSearchValue = ref(undefined);
//搜索过滤器
const tableSearchFilter = ref({});

//每页项目数量
const tableListRows = ref(TableListRowsOptions[0].value);

//EditUserDialog组件
const EditUserDialog_state = ref(false);
const EditUserDialog_data = ref({ origin: {}, edit: {} } as any);
const openEditUserDialog = (data: {}) => {
  EditUserDialog_data.value.origin = CommonUtils.deepClone(data);
  EditUserDialog_data.value.edit = CommonUtils.deepClone(data);
  EditUserDialog_state.value = true;
};

//DeleteUserDialog组件
const DeleteUserDialog_state = ref(false);
const DeleteUserDialog_data = ref({} as any);
const openDeleteUserDialog = (data: {}) => {
  DeleteUserDialog_data.value = data;
  DeleteUserDialog_state.value = true;
};

// 批量操作相关
const BatchUserBtnStatus = ref("");
//BatchUserDialog组件
const BatchUserDialog_state = ref(false);
const openBatchUserDialog = () => {
  if (tableSelected.value.length === 0) {
    notifier.toast({
      text: "请选择要操作的用户",
      type: "warning",
    });
    return;
  }

  if (BatchUserBtnStatus.value === "disable") {
    BatchUserDialog_state.value = true;
  }
};

//SearchUserDialog组件
const SearchUserDialog_state = ref(false);
//子父传参
const setTableSearchFilter = (data: any) => {
  tableSearchFilter.value = data;
}
const openSearchUserDialog = () => {
  SearchUserDialog_state.value = true;
};

//获取表格数据
const getTableData = () => {
  //合并参数
  const params = {
    page: tableCurrentPage.value,
    list_rows: tableListRows.value,
    search_value: tableSearchValue.value,
    ...tableSearchFilter.value
  };
  //请求API
  // if (tableSearchFilter.value) {
  //   //搜索时激活错误提醒
  //   ApiMonitor.setGetState(true);
  // }
  UsersApi.getUserIndex(params)
    .then((response) => {
      const data = response.data;
      tableCurrentPage.value = data.current_page;
      tablePaginationLength.value = data.last_page;
      tableItems.value = data.data;
    })
  // .finally(() => {
  //   if (tableSearchFilter.value) {
  //     //搜索后关闭错误提醒
  //     ApiMonitor.setGetState(false);
  //   }
  // });
};

//搜索防抖
const searchTableData = useDebounce(() => {
  getTableData();
}, 500);

//数据获取监控
watch([tableCurrentPage, tableListRows], (newValue, oldValue) => {
  getTableData();
});

//页面加载完成后获取数据
onMounted(() => {
  getTableData();
});
</script>
