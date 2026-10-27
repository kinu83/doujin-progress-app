<template>
  <main class="min-h-screen bg-[#edf6fa] px-4 py-6 text-[#263236] sm:px-6">
    <div class="mx-auto max-w-7xl">
      <div class="mb-5 flex flex-wrap items-center gap-3">
        <div class="items-center gap-3">
          <NuxtLink
            to="/"
            class="inline-flex items-center rounded-xl border-2 border-[#263236] bg-white px-4 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd] hover:shadow-[4px_4px_0_rgba(38,50,54,0.22)]"
          >
            ← 一覧に戻る
          </NuxtLink>
        </div>
      </div>

      <div>
        <section class="overflow-hidden rounded-3xl border-4 border-[#2c8d98] bg-white shadow-[5px_5px_0_rgba(44,141,152,0.16)]">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-dashed border-[#2c8d98] px-5 py-4">
            <div class="flex flex-wrap items-center gap-3">
              <div class="flex items-center overflow-hidden rounded-xl border-2 border-[#263236] bg-white shadow-[3px_3px_0_rgba(38,50,54,0.14)]">
                <button
                  type="button"
                  aria-label="前の月"
                  title="前の月"
                  class="grid h-10 w-10 place-items-center text-[#263236] transition hover:bg-[#edf6fa]"
                  @click="moveMonth(-1)"
                >
                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <h2 class="min-w-36 border-x-2 border-[#263236]/20 px-4 text-center text-xl font-black text-[#263236]">
                  {{ monthTitle }}
                </h2>
                <button
                  type="button"
                  aria-label="次の月"
                  title="次の月"
                  class="grid h-10 w-10 place-items-center text-[#263236] transition hover:bg-[#edf6fa]"
                  @click="moveMonth(1)"
                >
                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                class="rounded-xl border-2 border-[#263236] bg-white px-3 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.14)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                @click="goToday"
              >
                今日
              </button>
            </div>
            <div class="flex flex-wrap items-center justify-end gap-3">
              <div class="flex items-center gap-2 text-xs font-black text-[#263236]/60">
                <span class="h-2 w-8 rounded-full bg-[#2c8d98]" />
                作業時間
              </div>
              <div class="flex items-center gap-2 text-xs font-black text-[#263236]/60">
                <span class="h-2 w-8 rounded-full border-2 border-[#2c8d98]/50 bg-white" />
                予定
              </div>
              <p class="text-sm font-black text-[#263236]/60">
                {{ formatWorkDuration(monthTotals.actual) }} / {{ formatWorkDuration(monthTotals.planned) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-7 border-b-2 border-[#2c8d98] bg-[#edf6fa]">
            <div
              v-for="weekday in weekdays"
              :key="weekday"
              class="px-2 py-2 text-center text-xs font-black text-[#263236]/60"
            >
              {{ weekday }}
            </div>
          </div>

          <div class="grid grid-cols-7">
            <button
              v-for="day in calendarDays"
              :key="day.dateKey"
              type="button"
              class="flex min-h-28 flex-col items-start justify-start border-b border-r border-[#2c8d98]/20 p-2 text-left transition hover:bg-[#f7fcfd] sm:min-h-32"
              :class="[
                day.isCurrentMonth ? 'bg-white' : 'bg-[#edf6fa]/60 text-[#263236]/40',
                selectedDate === day.dateKey ? 'ring-2 ring-inset ring-[#2c8d98]' : '',
              ]"
              @click="selectDate(day.dateKey)"
            >
              <div class="flex w-full items-start justify-between gap-2">
                <span
                  class="grid h-7 w-7 place-items-center rounded-full text-sm font-black"
                  :class="day.isToday ? 'bg-[#ff4b1f] text-white shadow-[2px_2px_0_rgba(255,75,31,0.24)]' : 'text-[#263236]'"
                >
                  {{ day.dayNumber }}
                </span>
                <span
                  v-if="dayTotals(day.dateKey).planned || dayTotals(day.dateKey).actual"
                  class="text-[11px] font-black text-[#263236]/60"
                >
                  {{ formatWorkDuration(dayTotals(day.dateKey).actual) }}/{{ formatWorkDuration(dayTotals(day.dateKey).planned) }}
                </span>
              </div>

              <div class="mt-2 grid gap-1">
                <span
                  v-for="item in daySchedule(day.dateKey).slice(0, 3)"
                  :key="`${item.projectId}-${item.kind}`"
                  class="truncate rounded-md border px-2 py-1 text-[11px] font-black"
                  :class="scheduleClasses[item.kind]"
                >
                  {{ scheduleLabels[item.kind] }} {{ item.title }}
                </span>
                <span
                  v-if="daySchedule(day.dateKey).length > 3"
                  class="px-2 text-[11px] font-black text-[#263236]/40"
                >
                  他 {{ daySchedule(day.dateKey).length - 3 }} 件
                </span>
              </div>

              <div
                v-if="workBars(day.dateKey).length"
                class="mt-auto grid w-full gap-1 pt-2"
                :aria-label="`${day.dateKey} の作業時間 ${formatWorkDuration(dayTotals(day.dateKey).actual)}、予定 ${formatWorkDuration(dayTotals(day.dateKey).planned)}`"
              >
                <span
                  v-for="bar in workBars(day.dateKey)"
                  :key="bar.level"
                  class="h-1.5 w-full rounded-full border"
                  :class="barClass(bar)"
                  :style="barStyle(bar)"
                />
                <span
                  v-if="hasHiddenBars(day.dateKey)"
                  class="text-[10px] font-black text-[#263236]/40"
                >
                  +{{ hiddenBarCount(day.dateKey) }}
                </span>
              </div>
            </button>
          </div>
        </section>

        <div
          v-if="isWorkPanelOpen"
          class="fixed inset-0 z-40 bg-[#263236]/20 backdrop-blur-[1px]"
          @click.self="closeWorkPanel"
        >
          <aside
            class="ml-auto flex h-full min-h-0 w-full max-w-[420px] flex-col border-l-4 border-[#2c8d98] bg-white shadow-[-8px_0_0_rgba(44,141,152,0.16)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="work-panel-title"
          >
            <div class="flex items-start justify-between gap-4 border-b-2 border-dashed border-[#2c8d98] px-5 py-5">
              <div>
                <p class="text-sm font-black text-[#f36b00]">
                  {{ selectedDateLabel }}
                </p>
                <h2 id="work-panel-title" class="mt-1 text-lg font-black text-[#263236]">
                  作業時間
                </h2>
              </div>
              <button
                ref="closePanelButton"
                type="button"
                aria-label="作業時間入力を閉じる"
                title="閉じる"
                class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[#263236] bg-white text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.14)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                @click="closeWorkPanel"
              >
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div class="grid min-h-0 flex-1 auto-rows-max content-start gap-5 overflow-y-auto px-5 py-5">
              <section v-if="selectedSchedule.length" class="grid gap-2">
                <h3 class="text-sm font-black text-[#263236]/60">
                  予定日
                </h3>
                <div class="grid gap-2">
                  <NuxtLink
                    v-for="item in selectedSchedule"
                    :key="`${item.projectId}-${item.kind}`"
                    :to="`/projects/${item.projectId}`"
                    class="rounded-2xl border-2 px-4 py-3 text-sm font-black shadow-[3px_3px_0_rgba(38,50,54,0.12)]"
                    :class="scheduleClasses[item.kind]"
                  >
                    {{ scheduleLabels[item.kind] }} {{ item.title }}
                  </NuxtLink>
                </div>
              </section>

              <section class="grid auto-rows-max content-start gap-3">
                <h3 class="text-sm font-black text-[#263236]/60">
                  {{ projectSectionTitle }}
                </h3>

                <div
                  v-if="projects.length === 0"
                  class="rounded-2xl border-2 border-dashed border-[#2c8d98] bg-[#edf6fa] p-5 text-center text-sm font-bold text-[#263236]/60"
                >
                  プロジェクトを作成すると、日別予定を入力できます。
                </div>

                <div
                  v-else-if="editableProjects.length === 0"
                  class="rounded-2xl border-2 border-dashed border-[#2c8d98] bg-[#edf6fa] p-5 text-center text-sm font-bold text-[#263236]/60"
                >
                  この日は作業期間内のプロジェクトがありません。
                </div>

                <div
                  v-for="project in editableProjects"
                  :key="project.id"
                  class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]"
                >
                  <div class="flex items-start justify-between gap-3">
                    <NuxtLink
                      :to="`/projects/${project.id}`"
                      class="min-w-0 font-black text-[#263236] hover:text-[#2c8d98]"
                    >
                      {{ project.title }}
                    </NuxtLink>
                    <span class="shrink-0 rounded-full border-2 border-[#2c8d98] bg-[#edf6fa] px-2 py-1 text-xs font-black text-[#2c8d98]">
                      {{ project.totalPages }}P
                    </span>
                  </div>

                  <div class="mt-3 grid grid-cols-2 gap-2 text-xs font-black text-[#263236]/70">
                    <span class="rounded-xl border-2 border-[#2c8d98]/40 bg-[#edf6fa] px-3 py-2">
                      進捗 {{ calculateTotalProgress(project.pages, project.workProcessSteps) }}%
                    </span>
                    <span class="rounded-xl border-2 border-[#2c8d98]/40 bg-[#edf6fa] px-3 py-2">
                      残り {{ formatWorkDuration(calculateRemainingWork(project.pages, project.workProcessSteps)) }}
                    </span>
                  </div>

                  <p
                    v-if="projectUnplannedWork(project) > 0"
                    class="mt-3 w-fit rounded-full border border-[#263236]/20 bg-[#f7fcfd] px-3 py-1 text-[11px] font-black text-[#263236]/60"
                  >
                    未割り振り {{ formatWorkDuration(projectUnplannedWork(project)) }}
                  </p>

                  <p
                    v-if="selectedDateMode === 'past' && dailyEntry(project.id).planned > 0"
                    class="mt-3 text-xs font-black text-[#263236]/50"
                  >
                    この日の予定（参考）: {{ formatWorkDuration(dailyEntry(project.id).planned) }}
                  </p>

                  <div v-if="selectedDateMode !== 'past'" class="mt-4 grid gap-2">
                    <div
                      v-if="dailyGuide(project) > 0"
                      class="flex items-center justify-between gap-3 rounded-xl border-2 border-[#f36b00]/30 bg-[#fff2e3] px-3 py-2"
                    >
                      <span class="text-xs font-black text-[#f36b00]">
                        目安 {{ formatWorkDuration(dailyGuide(project)) }}/日
                      </span>
                      <button
                        type="button"
                        class="min-h-8 rounded-lg border-2 border-[#f36b00] bg-white px-3 py-1 text-xs font-black text-[#f36b00] transition hover:bg-[#fff8f0]"
                        @click="applyDailyGuide(project)"
                      >
                        目安を入れる
                      </button>
                    </div>

                    <label
                      :for="`planned-${project.id}`"
                      class="text-xs font-black text-[#263236]/60"
                    >
                      予定（時間）
                    </label>
                    <div class="flex items-center overflow-hidden rounded-xl border-2 border-[#2c8d98]/40 bg-white focus-within:border-[#2c8d98]">
                      <input
                        :id="`planned-${project.id}`"
                        :value="minutesToHoursInput(dailyEntry(project.id).planned)"
                        type="number"
                        min="0"
                        step="0.5"
                        :max="minutesToHoursInput(maxPlannedEntry(project.id))"
                        inputmode="decimal"
                        class="min-w-0 flex-1 px-3 py-2 text-sm font-bold text-[#263236] outline-none"
                        @change="handlePlannedEntry(project.id, $event)"
                      >
                      <span class="shrink-0 pr-3 text-xs font-black text-[#263236]/50">h</span>
                    </div>

                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="step in plannedSteps"
                        :key="step.amount"
                        type="button"
                        :aria-label="step.ariaLabel"
                        class="min-h-9 rounded-xl border-2 border-[#2c8d98]/40 bg-white px-3 py-1 text-xs font-black text-[#263236] transition hover:border-[#2c8d98] hover:bg-[#edf6fa]"
                        @click="adjustPlannedEntry(project.id, step.amount)"
                      >
                        {{ step.label }}
                      </button>
                    </div>

                    <p
                      v-if="plannedClampNotices[project.id]"
                      class="text-xs font-bold text-[#f36b00]"
                      role="status"
                    >
                      残り作業時間を超えるため、{{ formatWorkDuration(plannedClampNotices[project.id]) }} に合わせました。
                    </p>

                    <div class="mt-2 rounded-xl border-2 border-[#2c8d98]/40">
                      <button
                        type="button"
                        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-black text-[#263236] transition hover:bg-[#f7fcfd] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c8d98]"
                        :aria-expanded="Boolean(openAllocationSections[project.id])"
                        :aria-controls="`plan-allocation-${project.id}`"
                        @click="toggleAllocationSection(project.id)"
                      >
                        <span
                          class="text-xs transition-transform"
                          :class="{ 'rotate-90': openAllocationSections[project.id] }"
                          aria-hidden="true"
                        >
                          ▶
                        </span>
                        自動で割り振る
                      </button>

                      <div
                        v-if="openAllocationSections[project.id]"
                        :id="`plan-allocation-${project.id}`"
                        class="grid gap-3 border-t-2 border-[#2c8d98]/20 p-3"
                      >
                        <p class="text-xs font-bold text-[#263236]/60">
                          今日から締切までの残り作業を、日ごとに均等に割り振ります。
                        </p>

                        <label class="grid gap-1 text-xs font-black text-[#263236]/60">
                          土日の重み
                          <select
                            v-model.number="allocationOptionsFor(project.id).weekendWeight"
                            class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-3 py-2 text-sm font-bold text-[#263236] outline-none focus:border-[#2c8d98]"
                            @change="cancelAllocation(project.id)"
                          >
                            <option
                              v-for="weight in weekendWeights"
                              :key="weight"
                              :value="weight"
                            >
                              ×{{ weight }}
                            </option>
                          </select>
                        </label>

                        <fieldset class="grid gap-1">
                          <legend class="text-xs font-black text-[#263236]/60">
                            作業しない曜日
                          </legend>
                          <div class="flex flex-wrap gap-1">
                            <label
                              v-for="(weekday, index) in weekdays"
                              :key="weekday"
                              class="flex min-h-8 cursor-pointer items-center gap-1 rounded-lg border-2 px-2 text-xs font-black transition"
                              :class="allocationOptionsFor(project.id).restDays.includes(index)
                                ? 'border-[#263236]/40 bg-[#263236]/10 text-[#263236]/60'
                                : 'border-[#2c8d98]/40 bg-white text-[#263236]'"
                            >
                              <input
                                v-model="allocationOptionsFor(project.id).restDays"
                                type="checkbox"
                                :value="index"
                                class="h-3.5 w-3.5 accent-[#263236]"
                                @change="cancelAllocation(project.id)"
                              >
                              {{ weekday }}
                            </label>
                          </div>
                        </fieldset>

                        <p
                          v-if="allocationPlans[project.id]?.blockReason"
                          class="rounded-xl bg-[#edf6fa] px-3 py-2 text-xs font-bold text-[#263236]/60"
                        >
                          {{ allocationPlans[project.id]?.blockReason }}
                        </p>

                        <template v-else-if="allocationPlans[project.id]">
                          <div
                            v-if="confirmingAllocations[project.id]"
                            class="grid gap-2 rounded-xl border-2 border-[#f36b00]/40 bg-[#fff2e3] p-3 text-xs font-bold text-[#263236]"
                            role="alert"
                          >
                            <p>
                              {{ formatAllocationRange(allocationPlans[project.id]!) }} の {{ allocationPlans[project.id]!.workDayCount }}日<span v-if="allocationPlans[project.id]!.restDayCount">（休み {{ allocationPlans[project.id]!.restDayCount }}日）</span>に
                              {{ formatWorkDuration(allocationPlans[project.id]!.totalMinutes) }} を割り振ります。
                            </p>
                            <p v-if="allocationPlans[project.id]!.weekdayRange">
                              平日 {{ formatMinutesRange(allocationPlans[project.id]!.weekdayRange!) }}
                            </p>
                            <p v-if="allocationPlans[project.id]!.weekendRange">
                              土日 {{ formatMinutesRange(allocationPlans[project.id]!.weekendRange!) }}
                            </p>
                            <p
                              v-if="allocationPlans[project.id]!.overwriteCount"
                              class="font-black text-[#f36b00]"
                            >
                              既存の予定 {{ allocationPlans[project.id]!.overwriteCount }}日分は上書きされます。
                            </p>
                            <div class="flex gap-2">
                              <button
                                type="button"
                                class="min-h-9 flex-1 rounded-xl border-2 border-[#f36b00] bg-[#f36b00] px-3 py-1 text-xs font-black text-white transition hover:bg-[#e06200]"
                                @click="confirmAllocation(project.id)"
                              >
                                {{ allocationPlans[project.id]!.overwriteCount ? '上書きする' : '割り振る' }}
                              </button>
                              <button
                                type="button"
                                class="min-h-9 flex-1 rounded-xl border-2 border-[#263236]/30 bg-white px-3 py-1 text-xs font-black text-[#263236] transition hover:bg-[#f7fcfd]"
                                @click="cancelAllocation(project.id)"
                              >
                                やめる
                              </button>
                            </div>
                          </div>

                          <button
                            v-else
                            type="button"
                            class="min-h-9 rounded-xl border-2 border-[#2c8d98] bg-[#2c8d98] px-3 py-1 text-xs font-black text-white transition hover:bg-[#247a84]"
                            @click="requestAllocation(project.id)"
                          >
                            割り振る
                          </button>
                        </template>

                        <p
                          v-if="allocationDoneNotices[project.id]"
                          class="text-xs font-bold text-[#2c8d98]"
                          role="status"
                        >
                          予定を割り振りました。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="selectedDateMode !== 'future'"
                    class="mt-4 grid gap-3 border-t-2 border-dashed border-[#2c8d98]/40 pt-4"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <span class="text-xs font-black text-[#263236]/60">作業時間（実績）</span>
                      <span class="rounded-xl border-2 border-[#2c8d98]/40 bg-[#edf6fa] px-3 py-1 text-sm font-black text-[#263236]">
                        {{ formatWorkDuration(dailyActual(project.id)) }}
                      </span>
                    </div>

                    <div class="rounded-xl border-2 border-[#2c8d98]/40">
                      <button
                        type="button"
                        class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-black text-[#263236] transition hover:bg-[#f7fcfd] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c8d98]"
                        :aria-expanded="Boolean(openPageSections[project.id])"
                        :aria-controls="`page-progress-${project.id}`"
                        @click="togglePageSection(project.id)"
                      >
                        <span class="flex items-center gap-2">
                          <span
                            class="text-xs transition-transform"
                            :class="{ 'rotate-90': openPageSections[project.id] }"
                            aria-hidden="true"
                          >
                            ▶
                          </span>
                          ページを進める
                        </span>
                        <span class="text-xs text-[#263236]/50">
                          未完了 {{ incompletePageCount(project) }}P
                        </span>
                      </button>

                      <div
                        v-if="openPageSections[project.id]"
                        :id="`page-progress-${project.id}`"
                        class="grid gap-2 border-t-2 border-[#2c8d98]/20 p-3"
                      >
                        <label class="flex w-fit items-center gap-2 text-xs font-black text-[#263236]/60">
                          <input
                            v-model="showCompletedPages[project.id]"
                            type="checkbox"
                            class="h-4 w-4 accent-[#2c8d98]"
                          >
                          完了済みのページも表示
                        </label>

                        <PageProgressSlider
                          v-for="page in visiblePages(project)"
                          :key="page.pageNumber"
                          :page="page"
                          :work-process-steps="project.workProcessSteps"
                          @change="updatePageStatusForSelectedDate(project.id, page.pageNumber, $event)"
                        />

                        <p
                          v-if="visiblePages(project).length === 0"
                          class="rounded-xl bg-[#edf6fa] px-3 py-2 text-center text-xs font-bold text-[#263236]/60"
                        >
                          すべてのページが完了しています。
                        </p>
                      </div>
                    </div>

                    <div class="grid gap-2">
                      <label
                        :for="`manual-actual-${project.id}`"
                        class="text-xs font-black text-[#263236]/60"
                      >
                        その他の作業時間（ネーム・資料集め・入稿など）
                      </label>
                      <div class="flex items-center overflow-hidden rounded-xl border-2 border-[#2c8d98]/40 bg-white focus-within:border-[#2c8d98]">
                        <input
                          :id="`manual-actual-${project.id}`"
                          :value="minutesToHoursInput(getProjectManualActualMinutes(project.id, selectedDate))"
                          type="number"
                          min="0"
                          step="0.25"
                          inputmode="decimal"
                          class="min-w-0 flex-1 px-3 py-2 text-sm font-bold text-[#263236] outline-none"
                          @change="handleManualActualEntry(project.id, $event)"
                        >
                        <span class="shrink-0 pr-3 text-xs font-black text-[#263236]/50">h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { DailyWorkEntry, PageStatus, Project } from "~/types/project";
import { useProjects } from "~/composables/useProjects";
import { createStatusList, useProgress } from "~/composables/useProgress";
import {
  allocatePlannedMinutes,
  calculateDailyGuide,
  formatDateKey,
  listDateKeys,
  parseDateKey,
} from "~/utils/planAllocation";

type ScheduleKind = "event" | "deadline" | "start";

type DateMode = "past" | "today" | "future";

type AllocationOptions = {
  weekendWeight: number;
  restDays: number[];
};

type MinutesRange = {
  min: number;
  max: number;
};

type AllocationPlan = {
  blockReason?: string;
  plannedByDate: Record<string, number>;
  from: string;
  to: string;
  totalMinutes: number;
  workDayCount: number;
  restDayCount: number;
  weekdayRange?: MinutesRange;
  weekendRange?: MinutesRange;
  overwriteCount: number;
};

type ScheduleItem = {
  projectId: string;
  title: string;
  kind: ScheduleKind;
};

const {
  projects,
  loadProjects,
  updateDailyWorkEntry,
  replacePlannedEntries,
  updatePageStatus,
  getProjectDailyActualMinutes,
  getProjectManualActualMinutes,
  updateManualActualWorkLog,
} = useProjects();
const {
  calculateTotalProgress,
  calculateRemainingWork,
  formatWorkDuration,
} = useProgress();

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const workBarUnit = 60;
const maxCollapsedWorkBars = 4;
const plannedSteps = [
  { amount: -30, label: "−30m", ariaLabel: "予定を30分減らす" },
  { amount: 30, label: "+30m", ariaLabel: "予定を30分増やす" },
  { amount: 60, label: "+1h", ariaLabel: "予定を1時間増やす" },
];
const weekendWeights = [1, 1.5, 2];
// Firestoreルールの日付キー上限（dailyWorkEntries.keys().size() <= 800）に合わせる。
const maxDailyEntryCount = 800;
const scheduleLabels: Record<ScheduleKind, string> = {
  event: "イベント",
  deadline: "締切",
  start: "開始",
};
const scheduleClasses: Record<ScheduleKind, string> = {
  event: "border-red-500 bg-red-50 text-red-700",
  deadline: "border-[#ff4b1f] bg-[#fff2e3] text-[#f36b00]",
  start: "border-[#2c8d98] bg-[#edf6fa] text-[#2c8d98]",
};

const route = useRoute();
const today = new Date();
const initialDate = parseDateKeyFromQuery(route.query.date) ?? today;
const selectedDate = ref(formatDateKey(initialDate));
const visibleYear = ref(initialDate.getFullYear());
const visibleMonth = ref(initialDate.getMonth());
const isWorkPanelOpen = ref(Boolean(route.query.date));
const closePanelButton = ref<HTMLButtonElement | null>(null);
// 上限に丸めた入力だけ、丸めた後の値をプロジェクト別に表示する。
const plannedClampNotices = ref<Record<string, number>>({});
const openPageSections = ref<Record<string, boolean>>({});
const showCompletedPages = ref<Record<string, boolean>>({});
// 自動割り振りのオプションは保存せず、画面を開いている間だけプロジェクト別に保持する。
const allocationOptions = ref<Record<string, AllocationOptions>>({});
const openAllocationSections = ref<Record<string, boolean>>({});
const confirmingAllocations = ref<Record<string, boolean>>({});
const allocationDoneNotices = ref<Record<string, boolean>>({});

onMounted(() => {
  loadProjects();
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});

watch(isWorkPanelOpen, async (isOpen) => {
  if (!isOpen) return;

  // パネルを開いたらダイアログ内へフォーカスを移し、キーボード操作の起点にする。
  await nextTick();
  closePanelButton.value?.focus();
});

watch(selectedDate, () => {
  plannedClampNotices.value = {};
  confirmingAllocations.value = {};
  allocationDoneNotices.value = {};
});

const monthTitle = computed(() => {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
  }).format(new Date(visibleYear.value, visibleMonth.value, 1));
});

const selectedDateLabel = computed(() => {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(parseDateKey(selectedDate.value));
});

const calendarDays = computed(() => {
  const firstDay = new Date(visibleYear.value, visibleMonth.value, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  // 6週間分を固定で描画して、月送り時にカレンダーの高さが跳ねないようにする。
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = formatDateKey(date);

    return {
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === visibleMonth.value,
      isToday: dateKey === formatDateKey(today),
    };
  });
});

const monthTotals = computed(() => {
  return calendarDays.value.reduce(
    (sum, day) => {
      if (!day.isCurrentMonth) return sum;

      const totals = dayTotals(day.dateKey);
      sum.planned += totals.planned;
      sum.actual += totals.actual;
      return sum;
    },
    { planned: 0, actual: 0 }
  );
});

const selectedSchedule = computed(() => daySchedule(selectedDate.value));

const selectedDateMode = computed<DateMode>(() => {
  const todayKey = formatDateKey(new Date());

  if (selectedDate.value < todayKey) return "past";
  if (selectedDate.value === todayKey) return "today";

  return "future";
});

const projectSectionTitle = computed(() => {
  const titles: Record<DateMode, string> = {
    past: "プロジェクト別実績",
    today: "プロジェクト別予定・実績",
    future: "プロジェクト別予定",
  };

  return titles[selectedDateMode.value];
});

const allocationPlans = computed<Record<string, AllocationPlan>>(() => {
  return Object.fromEntries(
    editableProjects.value.map((project) => [project.id, buildAllocationPlan(project)])
  );
});

const editableProjects = computed(() => {
  return projects.value.filter((project) => {
    // 作業期間外でも、すでに予定や実績がある日は編集できるように残す。
    return isWithinWorkPeriod(project, selectedDate.value) || hasDailyEntry(project, selectedDate.value);
  });
});

function parseDateKeyFromQuery(value: unknown) {
  const dateKey = Array.isArray(value) ? value[0] : value;
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return null;
  }

  return parseDateKey(dateKey);
}

function moveMonth(amount: number) {
  const next = new Date(visibleYear.value, visibleMonth.value + amount, 1);
  visibleYear.value = next.getFullYear();
  visibleMonth.value = next.getMonth();
}

function goToday() {
  const now = new Date();
  selectedDate.value = formatDateKey(now);
  visibleYear.value = now.getFullYear();
  visibleMonth.value = now.getMonth();
}

function selectDate(dateKey: string) {
  selectedDate.value = dateKey;
  isWorkPanelOpen.value = true;
}

function closeWorkPanel() {
  isWorkPanelOpen.value = false;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && isWorkPanelOpen.value) {
    closeWorkPanel();
  }
}

function daySchedule(dateKey: string): ScheduleItem[] {
  return projects.value.flatMap((project) => {
    const items: ScheduleItem[] = [];

    // 1つのプロジェクトが同じ日に複数の節目を持つ場合は、それぞれ別ラベルで出す。
    if (project.eventDate === dateKey) {
      items.push(toScheduleItem(project, "event"));
    }

    if (project.deadline === dateKey) {
      items.push(toScheduleItem(project, "deadline"));
    }

    if (project.startDate === dateKey) {
      items.push(toScheduleItem(project, "start"));
    }

    return items;
  });
}

function toScheduleItem(project: Project, kind: ScheduleKind): ScheduleItem {
  return {
    projectId: project.id,
    // イベント日は作品タイトルよりイベント名を優先して、カレンダー上の意味を分かりやすくする。
    title: kind === "event" && project.eventName ? project.eventName : project.title,
    kind,
  };
}

function dayTotals(dateKey: string) {
  return projects.value.reduce(
    (sum, project) => {
      const entry = project.dailyWorkEntries[dateKey];
      const actual = getProjectDailyActualMinutes(project.id, dateKey);
      // 作業期間外の空データは月合計にも日別バーにも含めない。
      if (!entry && actual === 0) return sum;
      if (!isWithinWorkPeriod(project, dateKey) && (entry?.planned ?? 0) === 0 && actual === 0) return sum;

      sum.planned += entry?.planned ?? 0;
      sum.actual += actual;
      return sum;
    },
    { planned: 0, actual: 0 }
  );
}

function workBars(dateKey: string) {
  const totals = dayTotals(dateKey);
  const plannedBars = Math.ceil(totals.planned / workBarUnit);
  const actualBars = Math.ceil(totals.actual / workBarUnit);
  const totalBars = Math.max(plannedBars, actualBars);
  // 選択中の週以外は最大本数へ圧縮し、月表示の密度を保つ。
  const isCollapsed = !shouldShowAllBars(dateKey) && totalBars > maxCollapsedWorkBars;
  const visibleBars = isCollapsed
    ? maxCollapsedWorkBars
    : totalBars;

  return Array.from({ length: visibleBars }, (_, index) => {
    const level = visibleBars - index - 1;
    const fillRatio = totals.planned > 0
      ? totals.actual / totals.planned
      : Number(totals.actual > 0);
    // 圧縮時は予定と実績の比率を同じ本数の中へ写像して、超過分だけ色を分ける。
    const plannedRatioOfActual = totals.actual > 0
      ? totals.planned / totals.actual
      : 0;
    const plannedUnits = plannedRatioOfActual * visibleBars;
    const roundedPlannedUnits = Math.abs(plannedUnits - Math.round(plannedUnits)) < 0.00001
      ? Math.round(plannedUnits)
      : Math.floor(plannedUnits);
    const fillPercent = isCollapsed
      ? Math.max(0, Math.min((fillRatio * visibleBars - level) * 100, 100))
      : Number(level < actualBars) * 100;
    const plannedFillPercent = isCollapsed && totals.actual > totals.planned
      ? Math.max(0, Math.min((roundedPlannedUnits - level) * 100, 100))
      : fillPercent;

    return {
      level,
      fillPercent,
      plannedFillPercent,
      isCompressed: isCollapsed,
      isPlanned: isCollapsed || level < plannedBars,
      isActual: fillPercent > 0,
      isOverActual: totals.actual > totals.planned && fillPercent > 0 && (isCollapsed || level >= plannedBars),
    };
  });
}

function hasHiddenBars(dateKey: string) {
  if (shouldShowAllBars(dateKey)) return false;

  const totals = dayTotals(dateKey);
  const totalBars = Math.max(
    Math.ceil(totals.planned / workBarUnit),
    Math.ceil(totals.actual / workBarUnit)
  );

  return totalBars > maxCollapsedWorkBars;
}

function hiddenBarCount(dateKey: string) {
  if (shouldShowAllBars(dateKey)) return 0;

  const totals = dayTotals(dateKey);
  const totalBars = Math.max(
    Math.ceil(totals.planned / workBarUnit),
    Math.ceil(totals.actual / workBarUnit)
  );

  return Math.max(totalBars - maxCollapsedWorkBars, 0);
}

function barClass(bar: {
  isPlanned: boolean;
  isActual: boolean;
  isOverActual: boolean;
  isCompressed: boolean;
}) {
  if (bar.isCompressed) {
    return bar.isOverActual
      ? "border-[#f36b00] bg-white"
      : "border-[#2c8d98]/50 bg-white";
  }

  if (bar.isOverActual) return "border-[#f36b00]";
  if (bar.isActual) return "border-[#2c8d98]";
  if (bar.isPlanned) return "border-[#2c8d98]/50 bg-white";

  return "border-[#2c8d98]/20 bg-white";
}

function barStyle(bar: {
  fillPercent: number;
  plannedFillPercent: number;
  isActual: boolean;
  isOverActual: boolean;
  isCompressed: boolean;
}) {
  if (!bar.isActual) return {};

  if (bar.isCompressed && bar.isOverActual) {
    return {
      background: `linear-gradient(to right, #2c8d98 ${bar.plannedFillPercent}%, #f36b00 ${bar.plannedFillPercent}%, #f36b00 ${bar.fillPercent}%, #ffffff ${bar.fillPercent}%)`,
    };
  }

  const fillColor = bar.isOverActual ? "#f36b00" : "#2c8d98";

  return {
    background: `linear-gradient(to right, ${fillColor} ${bar.fillPercent}%, #ffffff ${bar.fillPercent}%)`,
  };
}

function shouldShowAllBars(dateKey: string) {
  // 選択中の週だけ詳細表示にして、クリックした日の周辺を読み取りやすくする。
  return getWeekStartKey(dateKey) === getWeekStartKey(selectedDate.value);
}

function getWeekStartKey(dateKey: string) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() - date.getDay());

  return formatDateKey(date);
}

function isWithinWorkPeriod(project: Project, dateKey: string) {
  if (!project.startDate || !project.deadline) return false;

  return project.startDate <= dateKey && dateKey <= project.deadline;
}

function hasDailyEntry(project: Project, dateKey: string) {
  const entry = project.dailyWorkEntries[dateKey];
  const actual = getProjectDailyActualMinutes(project.id, dateKey);

  return Boolean((entry && entry.planned > 0) || actual > 0);
}

function dailyEntry(projectId: string): DailyWorkEntry {
  const project = projects.value.find((item) => item.id === projectId);

  return project?.dailyWorkEntries[selectedDate.value] ?? {
    planned: 0,
    actual: 0,
  };
}

function dailyActual(projectId: string) {
  return getProjectDailyActualMinutes(projectId, selectedDate.value);
}

function projectRequiredWork(project: Project) {
  return calculateRemainingWork(project.pages, project.workProcessSteps);
}

function plannedLoad(project: Project, dateKey: string, planned: number) {
  const todayKey = formatDateKey(new Date());
  // 過去日の予定は残作業時間とは無関係なので、割り振り済みとして数えない。
  if (dateKey < todayKey) return 0;
  // 今日はすでに進めた分が残作業時間から減っているため、その分を予定から差し引く。
  if (dateKey === todayKey) {
    return Math.max(planned - getProjectDailyActualMinutes(project.id, dateKey), 0);
  }

  return planned;
}

function projectPlannedTotal(project: Project) {
  // 予定の割り振り過ぎを防ぐため、残作業時間に対応する今日以降の予定だけを集計する。
  return Object.entries(project.dailyWorkEntries).reduce((sum, [dateKey, entry]) => {
    return sum + plannedLoad(project, dateKey, entry.planned);
  }, 0);
}

function projectUnplannedWork(project: Project) {
  return Math.max(projectRequiredWork(project) - projectPlannedTotal(project), 0);
}

function maxPlannedEntry(projectId: string) {
  const project = projects.value.find((item) => item.id === projectId);
  if (!project) return 0;

  const dateKey = selectedDate.value;
  const current = dailyEntry(projectId);
  const otherPlanned = projectPlannedTotal(project) - plannedLoad(project, dateKey, current.planned);
  const available = Math.max(projectRequiredWork(project) - otherPlanned, 0);
  const todayKey = formatDateKey(new Date());

  // 過去日は入力済みの予定を削らないようにし、今日は進めた分を上乗せして入力できるようにする。
  if (dateKey < todayKey) return Math.max(current.planned, available);
  if (dateKey === todayKey) return available + dailyActual(projectId);

  return available;
}

function minutesToHoursInput(minutes: number) {
  // 入力欄は時間単位で表示し、0.25hなどの端数も小数2桁まで見せる。
  return Math.round((minutes / 60) * 100) / 100;
}

function savePlannedEntry(projectId: string, minutes: number) {
  const current = dailyEntry(projectId);
  const requested = Math.max(0, Math.round(Number.isFinite(minutes) ? minutes : 0));
  const planned = Math.min(requested, maxPlannedEntry(projectId));

  if (planned < requested) {
    plannedClampNotices.value[projectId] = planned;
  } else {
    delete plannedClampNotices.value[projectId];
  }

  if (planned === current.planned) return planned;

  updateDailyWorkEntry(projectId, selectedDate.value, {
    ...current,
    planned,
  });

  return planned;
}

function handlePlannedEntry(projectId: string, event: Event) {
  const input = event.target as HTMLInputElement;
  // 入力は確定時（blur/Enter）だけ保存して、1文字ごとの書き込みを避ける。
  const planned = savePlannedEntry(projectId, Number(input.value) * 60);
  input.value = String(minutesToHoursInput(planned));
}

function adjustPlannedEntry(projectId: string, amount: number) {
  savePlannedEntry(projectId, dailyEntry(projectId).planned + amount);
}

function remainingWorkDateKeys(project: Project) {
  return listDateKeys(formatDateKey(new Date()), project.deadline);
}

function dailyGuide(project: Project) {
  if (selectedDate.value > project.deadline) return 0;

  return calculateDailyGuide(projectRequiredWork(project), remainingWorkDateKeys(project).length);
}

function applyDailyGuide(project: Project) {
  // 今日の作業済み分は残り作業時間から引かれているため、予定には上乗せして入れる。
  const base = selectedDateMode.value === "today" ? dailyActual(project.id) : 0;

  savePlannedEntry(project.id, base + dailyGuide(project));
}

function allocationOptionsFor(projectId: string): AllocationOptions {
  // 描画中に状態を書き換えないよう、初期化はセクションを開いたときに行う。
  return allocationOptions.value[projectId] ?? {
    weekendWeight: 1,
    restDays: [],
  };
}

function allocationWeight(options: AllocationOptions, dateKey: string) {
  const weekday = parseDateKey(dateKey).getDay();
  if (options.restDays.includes(weekday)) return 0;

  return isWeekend(weekday) ? options.weekendWeight : 1;
}

function isWeekend(weekday: number) {
  return weekday === 0 || weekday === 6;
}

function buildAllocationPlan(project: Project): AllocationPlan {
  const todayKey = formatDateKey(new Date());
  const options = allocationOptionsFor(project.id);
  const dateKeys = remainingWorkDateKeys(project);
  const totalMinutes = projectRequiredWork(project);
  const workDateKeys = dateKeys.filter((dateKey) => allocationWeight(options, dateKey) > 0);
  const plan: AllocationPlan = {
    plannedByDate: {},
    from: dateKeys[0] ?? todayKey,
    to: project.deadline,
    totalMinutes,
    workDayCount: workDateKeys.length,
    restDayCount: dateKeys.length - workDateKeys.length,
    overwriteCount: Object.entries(project.dailyWorkEntries)
      .filter(([dateKey, entry]) => dateKey >= todayKey && entry.planned > 0)
      .length,
  };

  if (totalMinutes <= 0) return { ...plan, blockReason: "残り作業時間がないため、割り振る予定はありません。" };
  if (dateKeys.length === 0) return { ...plan, blockReason: "締切を過ぎているため、割り振れません。" };
  if (workDateKeys.length === 0) return { ...plan, blockReason: "作業する曜日を1つ以上残してください。" };

  const allocated = allocatePlannedMinutes({
    totalMinutes,
    dateKeys,
    weightOf: (dateKey) => allocationWeight(options, dateKey),
  });
  const weekdayMinutes: number[] = [];
  const weekendMinutes: number[] = [];

  for (const dateKey of workDateKeys) {
    const minutes = allocated[dateKey] ?? 0;
    (isWeekend(parseDateKey(dateKey).getDay()) ? weekendMinutes : weekdayMinutes).push(minutes);
  }

  // 今日の作業済み分は残り作業時間から引かれているため、予定には上乗せして保存する。
  const plannedByDate = Object.fromEntries(
    Object.entries(allocated).map(([dateKey, minutes]) => [
      dateKey,
      dateKey === todayKey ? minutes + getProjectDailyActualMinutes(project.id, dateKey) : minutes,
    ])
  );

  const remainingKeys = Object.keys(project.dailyWorkEntries).filter((dateKey) => {
    return dateKey < todayKey || getProjectDailyActualMinutes(project.id, dateKey) > 0;
  });
  const resultingKeys = new Set([
    ...remainingKeys,
    ...Object.keys(plannedByDate).filter((dateKey) => plannedByDate[dateKey] > 0),
  ]);
  if (resultingKeys.size > maxDailyEntryCount) {
    return { ...plan, blockReason: "期間が長すぎるため、自動割り振りできません。" };
  }

  return {
    ...plan,
    plannedByDate,
    weekdayRange: toMinutesRange(weekdayMinutes),
    weekendRange: toMinutesRange(weekendMinutes),
  };
}

function toMinutesRange(values: number[]): MinutesRange | undefined {
  if (values.length === 0) return undefined;

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function formatMinutesRange(range: MinutesRange) {
  if (range.min === range.max) return formatWorkDuration(range.min);

  return `${formatWorkDuration(range.min)}〜${formatWorkDuration(range.max)}`;
}

function formatAllocationRange(plan: AllocationPlan) {
  const format = (dateKey: string) => {
    const date = parseDateKey(dateKey);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return `${format(plan.from)}〜${format(plan.to)}`;
}

function toggleAllocationSection(projectId: string) {
  allocationOptions.value[projectId] ??= allocationOptionsFor(projectId);
  openAllocationSections.value[projectId] = !openAllocationSections.value[projectId];
  cancelAllocation(projectId);
}

function requestAllocation(projectId: string) {
  delete allocationDoneNotices.value[projectId];
  confirmingAllocations.value[projectId] = true;
}

function cancelAllocation(projectId: string) {
  delete confirmingAllocations.value[projectId];
}

function confirmAllocation(projectId: string) {
  const plan = allocationPlans.value[projectId];
  if (!plan || plan.blockReason) return;

  // 今日以降の予定（締切後も含む）をまとめて置き換え、残り作業時間の上限を超えないようにする。
  replacePlannedEntries(projectId, formatDateKey(new Date()), plan.plannedByDate);
  delete confirmingAllocations.value[projectId];
  delete plannedClampNotices.value[projectId];
  allocationDoneNotices.value[projectId] = true;
}

function togglePageSection(projectId: string) {
  openPageSections.value[projectId] = !openPageSections.value[projectId];
}

function isCompletedPage(project: Project, status: PageStatus) {
  const statuses = createStatusList(project.workProcessSteps);

  return status === statuses[statuses.length - 1];
}

function incompletePageCount(project: Project) {
  return project.pages.filter((page) => !isCompletedPage(project, page.status)).length;
}

function visiblePages(project: Project) {
  if (showCompletedPages.value[project.id]) return project.pages;

  // この日に進めたページは完了しても一覧から消さず、直前の操作を戻せるようにする。
  const touchedPageNumbers = new Set(
    project.workLogs
      .filter((log) => log.kind === "pageStatus" && log.workDate === selectedDate.value)
      .map((log) => log.pageNumber)
  );

  return project.pages.filter((page) => {
    return !isCompletedPage(project, page.status) || touchedPageNumbers.has(page.pageNumber);
  });
}

function updatePageStatusForSelectedDate(projectId: string, pageNumber: number, status: PageStatus) {
  // カレンダーで選んだ日の作業ログとして、ページ進捗の差分を記録する。
  updatePageStatus(projectId, pageNumber, status, {
    workDate: selectedDate.value,
    syncDailyActual: true,
  });
}

function handleManualActualEntry(projectId: string, event: Event) {
  const input = event.target as HTMLInputElement;
  const hours = Number(input.value);
  const minutes = Math.max(0, Math.round((Number.isFinite(hours) ? hours : 0) * 60));

  updateManualActualWorkLog(projectId, selectedDate.value, minutes);
  input.value = String(minutesToHoursInput(getProjectManualActualMinutes(projectId, selectedDate.value)));
}
</script>
