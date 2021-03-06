<template>
  <div class="cs-p">
    <el-form
      :inline="true"
      size="small">

      <el-form-item v-if="auth.add">
        <el-button
          icon="el-icon-plus"
          :disabled="loading"
          @click="create">新增位置</el-button>
      </el-form-item>

      <el-form-item v-if="auth.enable || auth.disable">
        <el-button-group>
          <el-button
            v-if="auth.enable"
            icon="el-icon-check"
            :disabled="loading"
            @click="handleStatus(null, 1, true)">启用</el-button>

          <el-button
            v-if="auth.disable"
            icon="el-icon-close"
            :disabled="loading"
            @click="handleStatus(null, 0, true)">禁用</el-button>
        </el-button-group>
      </el-form-item>

      <el-form-item v-if="auth.del">
        <el-button
          icon="el-icon-delete"
          :disabled="loading"
          @click="handleDelete(null)">删除</el-button>
      </el-form-item>

      <cs-help
        :router="$route.path"
        style="padding-bottom: 19px;">
      </cs-help>
    </el-form>

    <el-table
      v-loading="loading"
      :data="currentTableData"
      :highlight-current-row="true"
      @selection-change="handleSelectionChange"
      @sort-change="sortChange">
      <el-table-column align="center" type="selection" width="50"/>

      <el-table-column
        label="名称"
        prop="name"
        sortable="custom"
        min-width="180"
        :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.description"
            :content="`描述：${scope.row.description}`"
            placement="top-start">
            <i class="el-icon-tickets"/>
          </el-tooltip>
          {{scope.row.name}}
        </template>
      </el-table-column>

      <el-table-column
        label="编码"
        prop="code"
        min-width="80">
      </el-table-column>

      <el-table-column
        label="展示方式">
        <template slot-scope="scope">
          {{displayMap[scope.row.display]}}
        </template>
      </el-table-column>

      <el-table-column
        label="平台">
        <template slot-scope="scope">
          {{platformTable[scope.row.platform]}}
        </template>
      </el-table-column>

      <el-table-column
        label="类型"
        align="center">
        <template slot-scope="scope">
          <i :class="typeMap[scope.row.type].type"/>
        </template>
      </el-table-column>

      <el-table-column
        label="宽度"
        prop="width"
        sortable="custom">
      </el-table-column>

      <el-table-column
        label="高度"
        prop="height"
        sortable="custom">
      </el-table-column>

      <el-table-column
        label="背景色"
        min-width="90">
        <template slot-scope="scope">
          <span :style="`background-color:${scope.row.color}`">{{scope.row.color}}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="状态"
        prop="status"
        sortable="custom"
        align="center"
        width="100">
        <template slot-scope="scope">
          <el-tag
            size="mini"
            :type="statusMap[scope.row.status].type"
            :style="auth.enable || auth.disable ? 'cursor: pointer;' : ''"
            :effect="auth.enable || auth.disable ? 'light' : 'plain'"
            @click.native="handleStatus(scope.$index)">
            {{statusMap[scope.row.status].text}}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        min-width="100">
        <template slot-scope="scope">
          <el-button
            v-if="auth.set"
            size="small"
            @click="updata(scope.$index)"
            type="text">编辑</el-button>

          <el-button
            v-if="auth.del"
            size="small"
            @click="handleDelete(scope.$index)"
            type="text">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      :close-on-click-modal="false"
      width="760px">

      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        label-width="80px">

        <el-form-item
          label="名称"
          prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入广告位置名称"
            :clearable="true"/>
        </el-form-item>

        <el-form-item
          label="描述"
          prop="description">
          <el-input
            v-model="form.description"
            placeholder="可输入广告位置描述"
            type="textarea"
            :rows="3"/>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="展示方式"
              prop="display">
              <el-select
                v-model="form.display"
                placeholder="请选择"
                style="width: 100%;"
                value="">
                <el-option
                  v-for="(item, index) in displayMap"
                  :key="index"
                  :label="item"
                  :value="index"/>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="编码"
              prop="code">
              <el-input
                v-model="form.code"
                placeholder="可输入广告位置编码"
                :clearable="true"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="平台"
              prop="platform">
              <el-select
                v-model="form.platform"
                placeholder="请选择"
                style="width: 100%;"
                value="">
                <el-option
                  v-for="(item, index) in platformTable"
                  :key="index"
                  :label="item"
                  :value="index"/>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-row>
              <el-col :span="12">
                <el-form-item
                  label="宽度"
                  prop="width">
                  <el-input-number
                    v-model="form.width"
                    :min="0"
                    :controls="false"
                    style="width: 100%;"/>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item
                  label="高度"
                  prop="height">
                  <el-input-number
                    v-model="form.height"
                    :min="0"
                    :controls="false"
                    style="width: 100%;"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="类型"
              prop="type">
              <el-radio-group v-model="form.type">
                <el-radio label="0">图片</el-radio>
                <el-radio label="1">代码</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="背景色"
              prop="color">
              <el-color-picker v-model="form.color">
              </el-color-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item
          v-if="form.type === '0' && dialogFormVisible"
          label="图片"
          prop="content">
          <cs-photo v-model="content.image">
            <template slot="upload">
              <div
                v-if="!content.image.length"
                tabindex="0"
                style="margin-bottom: 8px;"
                class="el-upload el-upload--picture-card"
                @click="$refs.upload.handleUploadDlg()">
                <i class="el-icon-plus"/>
              </div>
            </template>
          </cs-photo>

          <el-button
            icon="el-icon-finished"
            @click="$refs.storage.handleStorageDlg([0, 2])"
            size="small">资源选择</el-button>

          <el-button
            icon="el-icon-upload2"
            @click="$refs.upload.handleUploadDlg()"
            size="small">上传图片</el-button>
        </el-form-item>

        <el-form-item
          v-if="form.type === '1' && dialogFormVisible"
          label="代码"
          prop="content">
          <cs-tinymce
            v-model="content.code"
            code="inside_content"
            :height="180"/>
        </el-form-item>

        <el-form-item
          label="状态"
          prop="status">
          <el-switch
            v-model="form.status"
            active-value="1"
            inactive-value="0">
          </el-switch>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button
          @click="dialogFormVisible = false"
          size="small">取消</el-button>

        <el-button
          v-if="dialogStatus === 'create'"
          type="primary"
          :loading="dialogLoading"
          @click="handleCreate"
          size="small">确定</el-button>

        <el-button
          v-else type="primary"
          :loading="dialogLoading"
          @click="handleUpdate"
          size="small">修改</el-button>
      </div>

      <cs-storage
        ref="storage"
        style="display: none"
        @confirm="_getStorageFileList">
      </cs-storage>

      <cs-upload
        style="display: none"
        ref="upload"
        type="slot"
        accept="image/*"
        @confirm="_getUploadFileList">
      </cs-upload>
    </el-dialog>
  </div>
</template>

<script>
import {
  setAdsPositionStatus,
  delAdsPositionList,
  addAdsPositionItem,
  setAdsPositionItem
} from '@/api/ads/position'

export default {
  components: {
    'csUpload': () => import('@/components/cs-upload'),
    'csStorage': () => import('@/components/cs-storage'),
    'csPhoto': () => import('@/components/cs-photo'),
    'csTinymce': () => import('@/components/cs-tinymce')
  },
  props: {
    tableData: {
      default: () => []
    },
    platformTable: {
      default: () => []
    },
    loading: {
      default: false
    }
  },
  data() {
    return {
      content: { image: [], code: '' },
      currentTableData: [],
      multipleSelection: [],
      dialogLoading: false,
      dialogFormVisible: false,
      dialogStatus: '',
      form: {},
      auth: {
        add: false,
        del: false,
        set: false,
        enable: false,
        disable: false
      },
      textMap: {
        update: '编辑位置',
        create: '新增位置'
      },
      displayMap: {
        0: '多个广告',
        1: '单个广告',
        2: '随机多个',
        3: '随机单个'
      },
      typeMap: {
        0: {
          text: '图片',
          type: 'el-icon-picture-outline'
        },
        1: {
          text: '代码',
          type: 'el-icon-document'
        }
      },
      statusMap: {
        0: {
          text: '禁用',
          type: 'danger'
        },
        1: {
          text: '启用',
          type: 'success'
        },
        2: {
          text: '...',
          type: 'info'
        }
      },
      rules: {
        code: [
          {
            max: 16,
            message: '长度不能大于 16 个字符',
            trigger: 'blur'
          }
        ],
        platform: [
          {
            required: true,
            message: '至少选择一项',
            trigger: 'change'
          }
        ],
        name: [
          {
            required: true,
            message: '名称不能为空',
            trigger: 'blur'
          },
          {
            max: 100,
            message: '长度不能大于 100 个字符',
            trigger: 'blur'
          }
        ],
        description: [
          {
            max: 255,
            message: '长度不能大于 255 个字符',
            trigger: 'blur'
          }
        ],
        width: [
          {
            type: 'number',
            message: '必须为数字值',
            trigger: 'blur'
          }
        ],
        height: [
          {
            type: 'number',
            message: '必须为数字值',
            trigger: 'blur'
          }
        ],
        type: [
          {
            required: true,
            message: '至少选择一项',
            trigger: 'change'
          },
          {
            type: 'enum',
            enum: ['0', '1'],
            message: '值的范围必须为 0 或 1',
            trigger: 'change'
          }
        ],
        display: [
          {
            required: true,
            message: '至少选择一项',
            trigger: 'change'
          },
          {
            type: 'enum',
            enum: ['0', '1', '2', '3'],
            message: '值的范围必须为 0 ~ 3',
            trigger: 'change'
          }
        ]
      }
    }
  },
  watch: {
    tableData: {
      handler(val) {
        this.currentTableData = val
      },
      immediate: true
    }
  },
  mounted() {
    this._validationAuth()
  },
  methods: {
    // 验证权限
    _validationAuth() {
      this.auth.add = this.$permission('/system/ads/position/add')
      this.auth.set = this.$permission('/system/ads/position/set')
      this.auth.del = this.$permission('/system/ads/position/del')
      this.auth.enable = this.$permission('/system/ads/position/enable')
      this.auth.disable = this.$permission('/system/ads/position/disable')
    },
    // 获取列表中的编号
    _getIdList(val) {
      if (val === null) {
        val = this.multipleSelection
      }

      let idList = []
      if (Array.isArray(val)) {
        val.forEach(value => {
          idList.push(value.ads_position_id)
        })
      } else {
        idList.push(this.currentTableData[val].ads_position_id)
      }

      return idList
    },
    // 获取上传资源
    _getUploadFileList(files) {
      if (!files.length) {
        return
      }

      for (const value of files) {
        if (value.status !== 'success') {
          continue
        }

        const response = value.response
        if (!response || response.status !== 200) {
          continue
        }

        if (response.data) {
          if (response.data[0]['type'] === 0) {
            this.content.image.push({
              name: response.data[0]['name'],
              source: response.data[0]['url'],
              url: '//' + response.data[0]['url']
            })
          }
        }
      }
    },
    // 获取选择资源
    _getStorageFileList(files) {
      if (!files.length) {
        return
      }

      files.forEach(value => {
        if (value.type === 0) {
          this.content.image.push({
            name: value.name,
            source: value.url,
            url: '//' + value.url
          })
        }
      })
    },
    // 选中数据项
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 获取排序字段
    sortChange({ column, prop, order }) {
      let sort = {
        order_type: undefined,
        order_field: undefined
      }

      if (column && order) {
        sort.order_type = order === 'ascending' ? 'asc' : 'desc'
        sort.order_field = prop
      }

      this.$emit('sort', sort)
    },
    // 批量设置状态
    handleStatus(val, status = 0, confirm = false) {
      let ads_position_id = this._getIdList(val)
      if (ads_position_id.length === 0) {
        this.$message.error('请选择要操作的数据')
        return
      }

      function setStatus(ads_position_id, status, vm) {
        setAdsPositionStatus(ads_position_id, status)
          .then(() => {
            vm.currentTableData.forEach((value, index) => {
              if (ads_position_id.indexOf(value.ads_position_id) !== -1) {
                vm.$set(vm.currentTableData, index, {
                  ...value,
                  status
                })
              }
            })

            vm.$message.success('操作成功')
          })
      }

      if (!confirm) {
        let oldData = this.currentTableData[val]
        const newStatus = oldData.status ? 0 : 1

        if (oldData.status > 1) {
          return
        }

        // 禁用权限检测
        if (newStatus === 0 && !this.auth.disable) {
          return
        }

        // 启用权限检测
        if (newStatus === 1 && !this.auth.enable) {
          return
        }

        this.$set(this.currentTableData, val, { ...oldData, status: 2 })
        setStatus(ads_position_id, newStatus, this)
        return
      }

      this.$confirm('确定要执行该操作吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      })
        .then(() => {
          setStatus(ads_position_id, status, this)
        })
        .catch(() => {
        })
    },
    // 批量删除
    handleDelete(val) {
      let ads_position_id = this._getIdList(val)
      if (ads_position_id.length === 0) {
        this.$message.error('请选择要操作的数据')
        return
      }

      this.$confirm('确定要执行该操作吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      })
        .then(() => {
          delAdsPositionList(ads_position_id)
            .then(() => {
              for (let i = this.currentTableData.length - 1; i >= 0; i--) {
                if (ads_position_id.indexOf(this.currentTableData[i].ads_position_id) !== -1) {
                  this.currentTableData.splice(i, 1)
                }
              }

              if (this.currentTableData.length <= 0) {
                this.$emit('refresh', true)
              }

              this.$message.success('操作成功')
            })
        })
        .catch(() => {
        })
    },
    // 新建位置
    create() {
      this.form = {
        name: '',
        code: '',
        platform: 0,
        description: '',
        width: 0,
        height: 0,
        content: undefined,
        color: '#FFFFFF',
        type: '0',
        display: '0',
        status: '1'
      }

      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }

        this.content = { image: [], code: '' }
        this.dialogStatus = 'create'
        this.dialogLoading = false
        this.dialogFormVisible = true
      })
    },
    // 根据类型获取广告位置的实际内容
    getFormContent() {
      return this.form.type === '0' ? this.content.image : this.content.code
    },
    // 请求创建位置
    handleCreate() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.dialogLoading = true
          this.form.color = this.form.color || ''
          this.form.content = this.getFormContent()

          addAdsPositionItem({ ...this.form })
            .then(res => {
              this.currentTableData.unshift(res.data)
              this.dialogFormVisible = false
              this.$message.success('操作成功')
            })
            .catch(() => {
              this.dialogLoading = false
            })
        }
      })
    },
    // 编辑位置
    updata(index) {
      this.currentIndex = index
      const data = this.currentTableData[index]

      this.form = {
        ...data,
        type: data.type.toString(),
        display: data.display.toString(),
        status: data.status.toString()
      }

      // 处理el-select项不存在的bug
      if (!this.platformTable.hasOwnProperty(this.form.platform)) {
        this.form.platform = undefined
      }

      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }

        // 初始化组件数据
        this.content = { image: [], code: '' }

        if (this.form.type === '0') {
          const imageFile = Array.isArray(this.form.content) ? this.form.content : []
          this.content.image = [...imageFile]
        } else {
          this.content.code = this.form.content.toString()
        }

        this.dialogStatus = 'update'
        this.dialogLoading = false
        this.dialogFormVisible = true
      })
    },
    // 请求编辑位置
    handleUpdate() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.dialogLoading = true
          this.form.color = this.form.color || ''
          this.form.content = this.getFormContent()

          setAdsPositionItem({ ...this.form })
            .then(res => {
              this.$set(this.currentTableData, this.currentIndex, res.data)
              this.dialogFormVisible = false
              this.$message.success('操作成功')
            })
            .catch(() => {
              this.dialogLoading = false
            })
        }
      })
    }
  }
}
</script>
