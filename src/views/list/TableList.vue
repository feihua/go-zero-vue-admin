<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="用户名">
                <a-input v-model="queryParam.name" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="使用状态">
                <a-select v-model="queryParam.status" placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">关闭</a-select-option>
                  <a-select-option value="2">运行中</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <!--            <template v-if="advanced">-->
            <!--              <a-col :md="8" :sm="24">-->
            <!--                <a-form-item label="调用次数">-->
            <!--                  <a-input-number v-model="queryParam.callNo" style="width: 100%"/>-->
            <!--                </a-form-item>-->
            <!--              </a-col>-->
            <!--              <a-col :md="8" :sm="24">-->
            <!--                <a-form-item label="更新日期">-->
            <!--                  <a-date-picker v-model="queryParam.date" style="width: 100%" placeholder="请输入更新日期"/>-->
            <!--                </a-form-item>-->
            <!--              </a-col>-->
            <!--              <a-col :md="8" :sm="24">-->
            <!--                <a-form-item label="使用状态">-->
            <!--                  <a-select v-model="queryParam.useStatus" placeholder="请选择" default-value="0">-->
            <!--                    <a-select-option value="0">全部</a-select-option>-->
            <!--                    <a-select-option value="1">关闭</a-select-option>-->
            <!--                    <a-select-option value="2">运行中</a-select-option>-->
            <!--                  </a-select>-->
            <!--                </a-form-item>-->
            <!--              </a-col>-->
            <!--              <a-col :md="8" :sm="24">-->
            <!--                <a-form-item label="使用状态">-->
            <!--                  <a-select placeholder="请选择" default-value="0">-->
            <!--                    <a-select-option value="0">全部</a-select-option>-->
            <!--                    <a-select-option value="1">关闭</a-select-option>-->
            <!--                    <a-select-option value="2">运行中</a-select-option>-->
            <!--                  </a-select>-->
            <!--                </a-form-item>-->
            <!--              </a-col>-->
            <!--            </template>-->
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => {this.queryParam = {};  $refs.table.refresh(true)}">重置</a-button>
                <!--                <a @click="toggleAdvanced" style="margin-left: 8px">-->
                <!--                  {{ advanced ? '收起' : '展开' }}-->
                <!--                  <a-icon :type="advanced ? 'up' : 'down'"/>-->
                <!--                </a>-->
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">新建</a-button>
        <a-dropdown v-action:edit v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1">
              <a-icon type="delete"/>
              删除
            </a-menu-item>
            <!-- lock | unlock -->
            <a-menu-item key="2">
              <a-icon type="lock"/>
              锁定
            </a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            批量操作
            <a-icon type="down"/>
          </a-button>
        </a-dropdown>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        :alert="true"
        :rowSelection="rowSelection"
        showPagination="auto"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter"/>
        </span>
        <span slot="description" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
        </span>

        <span slot="action" slot-scope="text, record">
          <template>
<!--            <a @click="handleEdit(record)">编辑</a>-->
            <!--            <a-divider type="vertical" />-->
            <!--            <a @click="handleSub(record)">删除</a>-->
            <a-button
              size="small"
              type="primary"
              @click="handleEdit(record)"
            >编辑</a-button>
            <a-divider type="vertical"/>
            <a-button
              size="small"
              type="danger"
              @click="() => delData(record.id)"
            >删除</a-button>
          </template>
        </span>
      </s-table>

      <create-form
        ref="createModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />
      <step-by-step-modal ref="modal" @ok="handleOk"/>
    </a-card>
  </page-header-wrapper>
</template>

<script>
  import moment from 'moment'
  import { Ellipsis, STable } from '@/components'
  import { addUser, deleteUser, list, update } from '@/api/user'

  import StepByStepModal from './modules/StepByStepModal'
  import CreateForm from './modules/CreateForm'

  const columns = [
    {
      title: '#',
      scopedSlots: { customRender: 'serial' }
    },
    {
      title: '用户名',
      dataIndex: 'name'
    },
    {
      title: '邮箱',
      dataIndex: 'email'
    },
    {
      title: '手机号',
      dataIndex: 'mobile'
    },
    {
      title: '状态',
      dataIndex: 'status',
      scopedSlots: { customRender: 'status' }
    },
    {
      title: '创建者',
      dataIndex: 'createBy'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime'
    },
    {
      title: '更新者',
      dataIndex: 'lastUpdateBy'
    },
    {
      title: '更新时间',
      dataIndex: 'lastUpdateTime'
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: '150px',
      scopedSlots: { customRender: 'action' }
    }
  ]

  const statusMap = {
    0: {
      status: 'default',
      text: '禁用'
    },
    1: {
      status: 'processing',
      text: '启用'
    },
    2: {
      status: 'success',
      text: '已上线'
    },
    3: {
      status: 'error',
      text: '异常'
    }
  }

  export default {
    name: 'TableList',
    components: {
      STable,
      Ellipsis,
      CreateForm,
      StepByStepModal
    },
    data() {
      this.columns = columns
      return {
        // create model
        visible: false,
        confirmLoading: false,
        mdl: null,
        // 高级搜索 展开/关闭
        advanced: false,
        // 查询参数
        queryParam: {},
        // 加载数据方法 必须为 Promise 对象
        loadData: parameter => {
          const requestParameters = Object.assign({}, parameter, this.queryParam)
          console.log('loadData request parameters:', requestParameters)
          requestParameters.current = 1
          requestParameters.pageSize = 10
          return list(requestParameters)
            .then(res => {
              console.log(res, 111111111)
              return res
            })
        },
        selectedRowKeys: [],
        selectedRows: []
      }
    },
    filters: {
      statusFilter(type) {
        return statusMap[type].text
      },
      statusTypeFilter(type) {
        return statusMap[type].status
      }
    },
    created() {
      // list({ current: 1, pageSize: 10 })
    },
    computed: {
      rowSelection() {
        return {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onSelectChange
        }
      }
    },
    methods: {
      handleAdd() {
        this.mdl = null
        this.visible = true
      },
      handleEdit(record) {
        this.visible = true
        this.mdl = { ...record }
      },
      handleOk() {
        const form = this.$refs.createModal.form
        this.confirmLoading = true
        form.validateFields((errors, values) => {
          if (!errors) {
            console.log('values', values)
            if (values.id > 0) {
              // 修改 e.g.
              new Promise((resolve, reject) => {
                update(values)
                resolve()
              }).then(res => {
                this.visible = false
                this.confirmLoading = false
                // 重置表单数据
                form.resetFields()
                // 刷新表格
                this.$refs.table.refresh()

                this.$message.info('修改成功')
              })
            } else {
              // 新增
              new Promise((resolve, reject) => {
                addUser(values)
                resolve()
              }).then(res => {
                this.visible = false
                this.confirmLoading = false
                // 重置表单数据
                form.resetFields()
                // 刷新表格
                this.$refs.table.refresh()

                this.$message.info('新增成功')
              })
            }
          } else {
            this.confirmLoading = false
          }
        })
      },
      handleCancel() {
        this.visible = false

        const form = this.$refs.createModal.form
        form.resetFields() // 清理表单数据（可不做）
      },
      handleSub(record) {
        if (record.status !== 0) {
          this.$message.info(`${record.no} 订阅成功`)
        } else {
          this.$message.error(`${record.no} 订阅失败，规则已关闭`)
        }
      },
      onSelectChange(selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectedRows = selectedRows
      },
      toggleAdvanced() {
        this.advanced = !this.advanced
      },
      resetSearchForm() {
        this.queryParam = {
          date: moment(new Date())
        }
      },
      delData(id) {
        const that = this;
        that.$confirm({
          title: "确定要删除选择的数据吗?",
          content: (h) => <div style="color:red;">数据删除后不可恢复</div>,
        okText: "确认",
        cancelText: "取消",
        onOk()
        {
          deleteUser({ids:[id]}).then((response) => {
            console.log(response)
            if (response.code=='000000') {
              that.$success({
                title: "提示：",
                content: "数据删除成功",
              });
              // 刷新表格
              that.$refs.table.refresh()
            } else {
              that.$error({
                title: "提示：",
                content: "数据删除失败",
              });
            }
          });

          console.log("OK：" + id)
        },
        onCancel ()
        {
          console.log("Cancel")
        }
      })
    }
  }
}
</script>
