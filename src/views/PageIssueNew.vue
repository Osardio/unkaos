<script lang="ts">
import rest from "../rest";
import {defineComponent} from "vue";
// import type {PropType} from "vue";
import type {Project} from "@/types/Project";
import type {Issue} from "@/types/Issue";
import type {RelationType} from "@/types/RelationType";
import type {Workflow} from "@/types/Workflow";
import type {IssueType} from "@/types/IssueType";
import type {IssueField} from "@/types/IssueField";
import type {Sprint} from "@/types/Sprint";
import type {User} from "@/types/User";
import type {IssueRelation} from "@/types/IssueRelation";
import type {IssueAction} from "@/types/IssueAction";
import type {IssueAttachment} from "@/types/IssueAttachment";

export default defineComponent({
  name: "PageIssueNew",
  props: {
    id: {
      type: String,
      default: "",
    }
  },
  data() {
    return {

      systemRelationTypes: [] as RelationType[],
      systemWorkflows: [] as Workflow[],
      systemIssueTypes: [] as IssueType[],
      systemIssueFields: [] as IssueField[],
      systemProjects: [] as Project[],
      systemSprints: [] as Sprint[],
      systemUsers: [] as User[],
      issue: {} as Issue,
      issueUuid: "",
      issueProject: {} as Project,
      issueWatch: false,
      issueRelations: [] as IssueRelation[],
      issueActions: [] as IssueAction[],
      issueAttachments: [] as IssueAttachment[],

      // TODO move to own component
      newRelationModalVisible: false,
      timeEntryModalVisible: false
    }
  },
  computed: {
    issueProjectNum() : string {
      if (this.issue.project_short_name && this.issue.num) {
        return this.issue.project_short_name + "-" + this.issue.num;
      } else {
        return "Новая задача";
      }
    }
  },
  methods: {
    async loadIssue() {
      const projectName = this.id.split("-")[0]
      const issueNumber = this.id.split("-")[1]
      // TODO a lot of this should be moved to a store
      this.systemProjects = (await rest.run_method("read_projects", {}))
      this.issueProject = this.systemProjects.find((project) => project.short_name === projectName)!
      this.issueUuid = (await rest.run_method("read_issue_uuid", { project_uuid: this.issueProject.uuid, num: issueNumber }))[0].uuid
      await this.getIssue();
      this.systemRelationTypes = (await rest.run_method("read_relation_types", {}))
      this.systemWorkflows = (await rest.run_method("read_workflows", {}))
      this.systemIssueTypes = (await rest.run_method("read_issue_types", {}))
      this.systemIssueFields = (await rest.run_method("read_fields", {}))
      this.systemSprints = (await rest.run_method("read_sprints", {}))
      this.systemUsers = (await rest.run_method("read_users", {}))
      await this.getIssueWatch();
      await this.getIssueRelations();
      await this.getIssueActions();
      await this.getIssueAttachments();
    },

    // TODO move A LOT to own components, link to store
    async getIssue() {
      this.issue = (await rest.run_method("read_issue", { uuid: this.issueUuid }))[0]
    },
    async getIssueWatch() {
      this.issueWatch = (await rest.run_method("read_watcher", { issue_uuid: this.issueUuid })).length > 0
    },
    async getIssueRelations() {
      this.issueRelations = (await rest.run_method("read_formated_relations", {issue_uuid: this.issueUuid}))
    },
    async upsertIssueRelation(options: any) {
      await rest.run_method("upsert_relations", options);
      await this.getIssueRelations();
    },

    async getIssueActions() {
      this.issueActions = (await rest.run_method("read_issue_formated_actions", { issue_uuid: this.issueUuid }))
    },
    async getIssueAttachments() {
      this.issueAttachments = (await rest.run_method("read_attachments", { issue_uuid: this.issueUuid }))
    }
  },
  async created() {
    console.log("PageIssueNew Created")
    await this.loadIssue()
  },
})
</script>


<template ref="issue">
  <div>
    <Transition name="element_fade">
      <KNewRelationModal
          v-if="newRelationModalVisible"
          @close_new_relation_modal="newRelationModalVisible = false"
          @relation_added="upsertIssueRelation"
          :relation_types="relation_types"
          :issue0_uuid="issueUuid"
      />
    </Transition>
    <Transition name="element_fade">
      <KTimeEntryModal
          v-if="timeEntryModalVisible"
          @close_time_entry_modal="timeEntryModalVisible = false"
          @ok_time_entry_modal="ok_time_entry_modal"
          @delete_time_entry="delete_time_entry"
          :time_entry="selected_time_entry"
      />
    </Transition>
    <div id="issue_top_panel" class="panel"   >
      <div class="issue-top-buttons">
        <Transition name="element_fade">
          <StringInput
              key="issue_code"
              class='issue-code'
              label=''
              :disabled="true"
              :value="issueProjectNum"
          >
          </StringInput>
        </Transition>
        <Transition name="element_fade">
          <div
              v-if="!loading && id !== ''"
              :class="{ 'issue-top-button-inactive': !edit_mode }"
              class="issue-top-button bx bx-edit"
              title="Редактировать задачу"
              @click="enter_edit_mode"
          >
          </div>
        </Transition>

        <Transition name="element_fade">
          <div
              v-if="!loading && id !== ''"
              class="issue-top-button"
              title="Следить за задачей (функция в разработке)"
              @click="togle_watch"
          >
            <IWatcher :enabled="watch"/>
          </div>
        </Transition>

        <Transition name="element_fade">
          <div class="issue-top-button">
            <a
                v-if="!loading && id != '' &&
            !$store.state['common']['is_mobile']"
                class="issue-clone-button bx bx-duplicate "
                title="Клонировать задачу"
                :href="get_clone_url()"
            >
            </a>
          </div>
        </Transition>

        <Transition name="element_fade">
          <div class="issue-top-button">
            <a
                v-if="!loading && id != '' &&
            !$store.state['common']['is_mobile']"
                class="make-child-btn issue-top-button bx bx-subdirectory-right"
                title="Создать дочернюю задачу"
                :href="('/issue?t=' + new Date().getTime() + '&parent_uuid=' + issue[0].uuid)"
            >
            </a>
          </div>
        </Transition>

        <Transition name="element_fade">
          <div
              v-if="!loading && $store.state['common']['is_mobile']"
              style="display: flex"
              class="watch"
              @click="card_open = !card_open"
          >
            {{ card_open ? ">>>" : "<<<" }}
          </div>
        </Transition>
      </div>


    </div>

    <div id="issue_down_panel">
      <div id="issue_main_panel" class="panel">

        <div class="issue-line" v-if="!loading && id !==''">
          <div class="issue-tags-container">
            <div class="tag-label-container"><i class='bx bx-purchase-tag'></i></div>
            <tagInput v-if="id!=''"
                      :values="issue_tags"
                      :value="tags"
                      @value_selected="tag_selected"
                      @value_deselected="tag_deselected"
                      @updated="field_updated"
            > </tagInput>
          </div>

          <div class="issue-author-container"
               :v-if="
              !loading &&
              id !== '' &&
              get_field_by_name('Автор').value !== undefined
            "
          >
            <UserInput
                label=""
                v-if="!loading && id != ''"
                :value="get_field_by_name('Автор').value"
                :disabled="true"
                class="issue-author-input"
            >
            </UserInput>

            <StringInput
                label=""
                :v-if="!loading && id != ''"
                :value="format_dt(issue[0].created_at)"
                :disabled="true"
                v-if="issue[0].created_at!==undefined"
            >
            </StringInput>
          </div>
        </div>

        <Transition name="element_fade">
          <div class="issue-line" v-if="!loading">

            <StringInput
                v-if="!loading && (edit_mode || id == '')"
                label="Название"
                :value="get_field_by_name('Название').value"
                class="issue-name-input"
                :class="{ 'issue-name-input-full': id != '' }"
                :id="'values.' + get_field_by_name('Название').idx + '.value'"
                parent_name="issue"
            >
            </StringInput>
            <span
                class="issue-title-span"
                v-if="!loading && !edit_mode && id != ''"
            >
              {{ get_field_by_name("Название").value }}
            </span>

            <SelectInput
                v-if="id == '' || edit_mode"
                label="Проект"
                key="issue_project_input"
                :value="issue[0].project_uuid"
                :values="systemProjects"
                :disabled="false"
                class="issue-project-input"
                :clearable="false"
                :parameters="{ clearable: false, reduce: (obj) => obj.uuid }"
                id="project_uuid"
                parent_name="issue"
            >
            </SelectInput>
          </div>
        </Transition>

        <KMarkdownInput
            style="margin-top: 10px"
            ref="issue_descr_text_inpt"
            parent_name="issue"
            placeholder="Описание задачи..."
            textarea_id="issue_description_textarea"
            transition="element_fade"
            v-if="!loading && (edit_mode || id === '')"
            :attachments="attachments"
            :value="get_field_by_name('Описание').value"
            :id="'values.' + get_field_by_name('Описание').idx + '.value'"
            @update_parent_from_input="edit_current_description"
            @paste="pasted"
            @attachment_added="add_attachment"
            @attachment_deleted="delete_attachment"
            @save="save"
        />

        <div id="issue_footer_buttons"
             v-if="!loading && id === ''">
          <KButton
              id="save_issue_btn"
              :name="'Создать задачу'"
              :func="'save_issue'"
              @button_ans="saved_new"
          />
        </div>

        <div class="edit-mode-btn-container" v-if="!loading && id != '' && (edit_mode || id == '')">
          <TransitionGroup name="element_fade">
            <KButton
                key="1"
                class="save-issue-edit-mode-btn"
                :name="!must_reload ? 'Сохранить' : 'Описание изменено параллельно. Скопируйте свое и обновите страницу'"
                :disabled="must_reload"
                @click="save"
            />
            <KButton
                key="2"
                class="cancel-issue-edit-mode-btn"
                name="Отменить"
                @click="cancel_edit_mode"
            />
          </TransitionGroup>
        </div>

        <Transition name="element_fade">
          <KMarked v-if="!loading"
                   :val="current_description ? current_description_with_implants : ''"
                   :images="images_with_implants_images"
                   :use_bottom_images="true"
          >
          </KMarked>
        </Transition>

        <Transition name="element_fade">
          <KRelations
              v-if="!loading && id != ''"
              label=""
              id="issue-relations"
              @new_relation="newRelationModalVisible = true"
              :formated_relations="formated_relations"
              @relation_deleted="delete_relation"
          >
          </KRelations>
        </Transition>
        <Transition name="element_fade">
          <KTimeEntries
              v-if="!loading && id != ''"
              label=""
              id="issue_time_entries"
              @new_time_entry="new_time_entry"
              :time_entries="time_entries"
              @edit_time_entry="edit_time_entry"
          >
          </KTimeEntries>
        </Transition>
        <KAttachment
            transition="element_fade"
            id="issue-attachments"
            v-if="!loading && id != ''"
            :attachments="attachments"
            @attachment_added="add_attachment"
            @attachment_deleted="delete_attachment"
        >
        </KAttachment>
        <KMarkdownInput
            class="comment_input"
            style="margin-top: 20px"
            placeholder="Комментарий к задаче..."
            textarea_id="issue_comment_textarea"
            transition="element_fade"
            v-if="!loading && !edit_mode && id !== ''"
            :attachments="attachments"
            :value="comment"
            @update_parent_from_input="update_comment"
            @paste="pasted"
            @input_focus="comment_focus"
            @attachment_added="add_attachment"
            @attachment_deleted="delete_attachment"
        />
        <Transition name="element_fade">
          <KButton
              v-if="!loading && !edit_mode && id !== ''"
              id="send_comment_btn"
              name="Отправить"
              v-bind:class="{ outlined: comment_focused }"
              @click="send_comment()"
              :disabled="comment === ''"
          />
        </Transition>
        <CommentList
            v-if="!loading && !edit_mode && id != ''"
            v-model:actions="actions_with_time_entries"
            :images="images"
        />

        <GptPanel
            v-if="!loading && id !== '' && !$store.state['common']['is_mobile']"
            :context="issue"
        />
      </div>
      <div
          id="issue_card"
          class="panel"
          :class="{
          'hidden-card': !card_open && $store.state['common']['is_mobile'],
        }"
      >
        <Transition name="element_fade">
          <div id="issue_card_scroller" v-if="!loading">
            <StringInput
                v-if="
                !loading &&
                issue[0] != undefined &&
                $store.state['common']['is_mobile']
              "
                key="issue_code"
                label=""
                :disabled="true"
                :value="id"
            >
            </StringInput>


            <Transition name="element_fade">
              <div class="issue-transitions" v-if="!loading && id!='' && available_transitions.length <= max_status_buttons_count && !$store.state['common']['is_mobile']" style="display: flex;">
                <KButton
                    v-for="(transition, index) in available_transitions"
                    :key="index"
                    class="status-btn"
                    :name="transition.name"
                    :func="''"
                    @click="set_status(transition.status_to_uuid)"
                />
              </div>
            </Transition >

            <Transition name="element_fade">
              <SelectInput
                  v-if="!loading && issue[0] != undefined && id!='' && !$store.state['common']['is_mobile']"
                  label="Статус"
                  :value="get_status()"
                  :values="statuses"
                  :disabled="transitions.length <= max_status_buttons_count"
                  class="issue-status-input"
                  :parameters="{clearable: false, reduce: obj => obj.uuid}"
                  @update_parent_from_input="update_statuses"
              >
              </SelectInput>
            </Transition>


            <SelectInput
                v-if="
                !loading &&
                issue[0] != undefined
              "
                label="Тип задачи"
                key="issue_type_input"
                :value="get_type_uuid()"
                :values="get_types()"
                @updated="type_updated"
                class="issue-type-input"
                :parameters="{ clearable: false, reduce: (obj) => obj.uuid }"
                @update_parent_from_input="update_type"
            >
            </SelectInput>

            <SelectInput
                v-if="
                !loading &&
                issue[0] != undefined &&
                id != '' &&
                $store.state['common']['is_mobile']
              "
                label=""
                :value="get_status()"
                :values="statuses"
                :disabled="transitions.length == 0"
                :parameters="{ clearable: false, reduce: (obj) => obj.uuid }"
                @update_parent_from_input="update_statuses"
            >
            </SelectInput>

            <SelectInput
                label="Спринт"
                v-if="!loading"
                class="issue-sprint-input"
                :value="issue[0].sprint_uuid"
                :parent_name="'issue'"
                :values="sprints"
                :parameters="{ clearable: true, reduce: (obj) => obj.uuid }"
                id="sprint_uuid"
                @updated="field_updated(val)"
            >
            </SelectInput>

            <NumericInput
                label="Затраченное время"
                v-if="!loading"
                class="issue-spent-time-input"
                :value="issue[0].spent_time"
                :parent_name="'issue'"
                :disabled="true"
                id="spent_time"
                @updated="field_updated(val)"
                @click="new_time_entry()"
            >
            </NumericInput>

            <component
                v-bind:is="input.type + 'Input'"
                v-for="(input, index) in get_fields_exclude_names([
                'Название',
                'Описание',
                'Автор',
              ])"
                :label="input.label"
                :key="index"
                :id="'values.' + input.idx + '.value'"
                :value="input.value"
                :parent_name="'issue'"
                :disabled="input.disabled"
                :values="get_available_values(input.field_uuid)"
                @updated="field_updated"
            ></component>

          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>


<style lang="scss">
@import "../css/palette.scss";
@import "../css/global.scss";

$issue-workspace-width: 78%;
$card-width: calc(100% - $issue-workspace-width);
$code-width: 160px;

#issue_top_panel {
  height: $top-menu-height;
  display: flex;
  padding-left: 15px;
}

.iframe-view #issue_top_panel{
  border: none;
}

.issue-top-buttons {
  display: flex;
  align-items: center;
  padding: 10px 20px;
}

.issue-top-buttons > *:not(:last-child) {
  margin-right: 15px;
}

.issue-clone-button {
  font-size: 35px;
  text-decoration: none;
  color: var(--on-button-icon-color);
}

.make-child-btn {
  display: flex !important;
  font-size: 27px !important;
  border-radius: 50% !important;
  border-style: solid;
  padding-top: 4px;
  padding-left: 4px;
  width: 32px !important;
  height: 32px !important;
}


.issue-transitions {
  padding-top: 10px;
  flex-direction: column;
  margin-bottom: 0 !important;
}

#issue_table_panel,
#issue_card {
  height: calc(100vh - $top-menu-height);
}

.issue-code {
  width: $code-width;
}

#issue_main_panel {
  padding: 10px 30px 10px 35px;
  border-right: 5px solid var(--panel-bg-color);
  display: flex;
  flex-direction: column;
  width: $issue-workspace-width;
  overflow-y: auto;
  overflow-anchor: none;
  //scrollbar-color: red;
}

#issue_main_panel * {
  user-select: text;
}

#issue_main_panel .text {
  margin-bottom: 10px;
}

.mobile-view #issue_main_panel {
  width: 100vw !important;
}

#issue_footer_buttons {
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  width: 100%;
}


#save_issue_btn {
  width: 160px;
}

#save_issue_btn input {
  width: 100%;
  height: 30px;
}

#issue_card {
  width: $card-width;
  margin-left: 0px;
  display: flex;
  flex-direction: column;
}

.mobile-view #issue_card {
  position: absolute;
  width: 100vw;
  left: 0px;
}

.hidden-card {
  left: 100vw !important;
}


#issue_down_panel {
  display: flex;
  height: calc(100vh - $top-menu-height);
  width: calc(100vw - $main-menu-width);
  position: absolute;
}

.mobile-view #issue_down_panel {
  height: calc(100vh - $main-menu-width);
  width: 100vw;
}

.issue-line {
  display: flex;
  justify-content: space-between;
  // margin-bottom: 20px;
}

#issue_description_textarea {
  padding: 4px 10px 6px 10px;
  min-height: 60px;
  transition: none;
}


.status-btn,
.status-btn .btn_input {
  height: $input-height !important;
  width: 100% !important;
  margin-bottom: 10px;
  //margin-right: 20px;
}

.issue-name-input {
  width: 70%;
}

.issue-name-input-full {
  width: 100%;
}

.issue-author-input {
}

#send_comment_btn {
  .disabled-btn {
    background-color: var(--panel-bg-color);
  }
}

#send_comment_btn .btn_input {
  height: 25px;
  width: 100%;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-width: 1px;
  border-left-color: var(--border-color);
  border-top-color: var(--border-color);
}

.comment_input {
  margin-bottom: -4px !important;
}

.comment_input {

  textarea {
    border-bottom-left-radius: 0px !important;
    border-bottom-right-radius: 0px !important;
  }

}

.outlined input {
  outline: 1px solid;
}

.issue-status-input .vs__dropdown-toggle {
  border-width: 1px !important;
}

.issue-project-input {
  width: 27%;
  margin-left: 10px;
}

#issue_card_scroller {
  display: flex;
  flex-direction: column;
  padding: 10px 25px 10px 25px;
  height: calc(100vh - $top-menu-height);
  overflow-y: scroll;
}

#issue_card_scroller > *:not(:last-child) {
  margin-bottom: 15px;
}

#issue_card_scroller::-webkit-scrollbar {
  display: none;
}


.bx-paperclip {
  font-size: $font-size * 1.4;
}

#issue-attachments {
  margin-top: 20px;
  width: 100%;
}

.image-attachments {
  margin-left: 20px;
  margin-right: 20px;
}

.image-attachment-div {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.issue-title-span {
  margin: 10px 0;
  font-size: 22px;
  width: 100%;
  user-select: text;
}

.edit-mode-btn-container {
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}

.edit-mode-btn-container .btn {
  width: 50%;
}

.edit-mode-btn-container input {
  height: 25px !important;
  width: 100% !important;
}

.save-issue-edit-mode-btn {
  padding-right: $input-height;
}
.cancel-issue-edit-mode-btn {
  padding-left: $input-height;
}

.bx-purchase-tag
{
  font-size: 18px;
  padding: 6px 0;
}

.issue-tags-container, .issue-author-container{
  display: inherit;
}

.issue-tags-container .tag-input{
  font-size: 13px;
  padding-left: 5px;
}

.issue-author-container *{
  background: none !important;
  border: none !important;
}

.issue-author-container svg{
  display: none;
}
.issue-author-container .vs__actions, .issue-author-container .vs__search{
  display: none;
}

.issue-author-container{
}

.issue-author-container .string-input{
  width: 130px !important;
}

.issue-spent-time-input *{
  cursor: pointer !important;
}

.issue-spent-time-input:hover input{
  color: green !important;
}


/*
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}*/
</style>
