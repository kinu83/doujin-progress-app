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
                  <NuxtLink
                    :to="`/projects/${project.id}`"
                    class="block font-black text-[#263236] hover:text-[#2c8d98]"
                  >
                    {{ project.title }}
                  </NuxtLink>

                  <div class="mt-1 flex items-center justify-between gap-3 text-xs font-black text-[#263236]/60">
                    <p class="flex min-w-0 flex-wrap gap-x-2">
                      <span v-if="project.eventDate">
                        {{ formatProjectDate(project.eventDate) }}
                      </span>
                      <span v-if="project.eventName.trim()" class="min-w-0 break-all">
                        {{ project.eventName.trim() }} 合わせ
                      </span>
                    </p>
                    <span class="shrink-0 rounded-full border-2 border-[#2c8d98] bg-[#edf6fa] px-2 py-1 text-xs font-black text-[#2c8d98]">
                      {{ project.totalPages }}P
                    </span>
                  </div>

                  <div class="mt-5 flex items-center gap-6">
                    <div
                      class="flex shrink-0 items-end gap-1.5"
                      role="img"
                      :aria-label="`作業時間 ${formatWorkDuration(dailyActual(project.id))}、予定 ${formatWorkDuration(dailyEntry(project.id).planned)}`"
                    >
                      <div
                        v-for="(column, columnIndex) in projectWorkBarColumns(project.id)"
                        :key="columnIndex"
                        class="grid gap-1.5"
                        :class="projectWorkBarColumns(project.id).length > 1 ? 'w-12' : 'w-24'"
                      >
                        <span
                          v-for="bar in column"
                          :key="bar.level"
                          class="h-3 w-full rounded-sm border-2"
                          :class="barClass(bar)"
                          :style="barStyle(bar)"
                        />
                      </div>
                      <span
                        v-if="projectWorkBarColumns(project.id).length === 0"
                        class="h-3 w-24 rounded-sm border-2 border-dashed border-[#2c8d98]/30"
                      />
                    </div>

                    <dl class="flex items-end gap-4">
                      <div v-if="selectedDateMode !== 'future'" class="grid gap-2">
                        <dt class="text-sm font-black text-[#263236]">
                          実績
                        </dt>
                        <dd class="text-xl font-black text-[#263236]">
                          {{ formatWorkDuration(dailyActual(project.id)) }}
                        </dd>
                      </div>
                      <span
                        v-if="selectedDateMode !== 'future'"
                        class="text-xl font-black text-[#263236]/40"
                        aria-hidden="true"
                      >/</span>
                      <div class="grid gap-2">
                        <dt class="text-sm font-black text-[#263236]">
                          予定
                        </dt>
                        <dd class="text-xl font-black text-[#2c8d98]">
                          {{ formatWorkDuration(dailyEntry(project.id).planned) }}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <fieldset v-if="selectedDateMode !== 'past'" class="mt-4 grid gap-2">
                    <legend class="mb-2 text-xs font-black text-[#263236]/60">
                      予定を入力
                    </legend>
                    <div class="flex items-center gap-2">
                      <div class="flex flex-1 items-center overflow-hidden rounded-xl border-2 border-[#2c8d98]/40 bg-white focus-within:border-[#2c8d98]">
                        <input
                          :value="Math.floor(dailyEntry(project.id).planned / 60)"
                          type="number"
                          min="0"
                          step="1"
                          inputmode="numeric"
                          aria-label="予定（時間）"
                          class="min-h-11 min-w-0 flex-1 px-3 text-sm font-bold text-[#263236] outline-none"
                          @change="handlePlannedPart(project.id, 'hours', $event)"
                        >
                        <span class="shrink-0 pr-3 text-xs font-black text-[#263236]/50">h</span>
                      </div>
                      <div class="flex flex-1 items-center overflow-hidden rounded-xl border-2 border-[#2c8d98]/40 bg-white focus-within:border-[#2c8d98]">
                        <select
                          :value="dailyEntry(project.id).planned % 60"
                          aria-label="予定（分）"
                          class="min-h-11 min-w-0 flex-1 bg-white px-3 text-sm font-bold text-[#263236] outline-none"
                          @change="handlePlannedPart(project.id, 'minutes', $event)"
                        >
                          <option
                            v-for="minute in plannedMinuteOptions(dailyEntry(project.id).planned)"
                            :key="minute"
                            :value="minute"
                          >
                            {{ minute }}
                          </option>
                        </select>
                        <span class="shrink-0 pr-3 text-xs font-black text-[#263236]/50">m</span>
                      </div>
                    </div>

                    <div class="grid grid-cols-3 gap-2">
                      <button
                        v-for="step in plannedSteps"
                        :key="step.amount"
                        type="button"
                        :aria-label="step.ariaLabel"
                        class="min-h-11 rounded-xl border-2 border-[#2c8d98]/40 bg-white px-2 text-xs font-black text-[#263236] transition hover:border-[#2c8d98] hover:bg-[#edf6fa]"
                        @click="adjustPlannedEntry(project.id, step.amount)"
                      >
                        {{ step.label }}
                      </button>
                      <button
                        v-if="dailyGuide(project) > 0"
                        type="button"
                        :aria-label="`予定を目安の${formatWorkDuration(dailyGuideTarget(project))}にする`"
                        :aria-pressed="isDailyGuideApplied(project)"
                        class="min-h-11 rounded-xl border-2 px-2 text-xs font-black transition"
                        :class="isDailyGuideApplied(project)
                          ? 'border-[#f36b00] bg-[#f36b00] text-white'
                          : 'border-[#f36b00]/60 bg-[#fff2e3] text-[#f36b00] hover:border-[#f36b00]'"
                        @click="applyDailyGuide(project)"
                      >
                        目安 {{ formatWorkDuration(dailyGuide(project)) }}
                      </button>
                    </div>

                    <p
                      v-if="plannedClampNotices[project.id]"
                      class="text-xs font-bold text-[#f36b00]"
                      role="status"
                    >
                      残り作業時間を超えるため、{{ formatWorkDuration(plannedClampNotices[project.id]) }} に合わせました。
                    </p>

                    <button
                      type="button"
                      class="flex min-h-11 items-center justify-between rounded-xl border-2 border-[#2c8d98]/40 bg-white px-3 text-sm font-black text-[#263236] transition hover:border-[#2c8d98] hover:bg-[#f7fcfd]"
                      aria-haspopup="dialog"
                      @click="openAllocationDialog(project.id)"
                    >
                      今日〜締切を自動で割り振る
                      <span aria-hidden="true">›</span>
                    </button>

                    <p
                      v-if="allocationDoneNotices[project.id]"
                      class="text-xs font-bold text-[#2c8d98]"
                      role="status"
                    >
                      予定を割り振りました。
                    </p>
                  </fieldset>

                  <section
                    v-if="selectedDateMode !== 'future'"
                    class="mt-5 grid gap-2 border-t-2 border-dashed border-[#2c8d98]/40 pt-4"
                    :aria-labelledby="`page-progress-title-${project.id}`"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <h4
                        :id="`page-progress-title-${project.id}`"
                        class="text-sm font-black text-[#263236]"
                      >
                        実績入力
                      </h4>
                      <span class="text-xs font-black text-[#263236]/50">
                        未完了 {{ incompletePageCount(project) }}P
                      </span>
                    </div>

                    <label class="flex min-h-9 w-fit items-center gap-2 text-xs font-black text-[#263236]/60">
                      <input
                        v-model="showCompletedPages[project.id]"
                        type="checkbox"
                        class="h-4 w-4 accent-[#2c8d98]"
                      >
                      完了済みのページも表示
                    </label>

                    <div class="grid max-h-96 gap-2 overflow-y-auto pr-1">
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
                  </section>
                </div>
              </section>
            </div>
          </aside>
        </div>

        <div
          v-if="allocationTarget"
          class="fixed inset-0 z-50 grid place-items-center bg-[#263236]/30 px-4"
          @click.self="closeAllocationDialog"
        >
          <div
            class="grid max-h-[90vh] w-full max-w-sm gap-3 overflow-y-auto rounded-2xl border-4 border-[#2c8d98] bg-white p-5 shadow-[5px_5px_0_rgba(44,141,152,0.16)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="allocation-dialog-title"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 id="allocation-dialog-title" class="text-base font-black text-[#263236]">
                  自動で割り振る
                </h2>
                <p class="mt-1 text-xs font-black text-[#263236]/60">
                  {{ allocationTarget.title }}
                </p>
              </div>
              <button
                ref="closeAllocationButton"
                type="button"
                aria-label="自動割り振りを閉じる"
                title="閉じる"
                class="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#263236] bg-white text-[#263236] transition hover:bg-[#f7fcfd]"
                @click="closeAllocationDialog"
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

            <p class="text-xs font-bold text-[#263236]/60">
              今日から締切までの残り作業を、日ごとに均等に割り振ります。
            </p>

            <label class="grid gap-1 text-xs font-black text-[#263236]/60">
              土日の重み
              <select
                v-model.number="allocationOptionsFor(allocationTarget.id).weekendWeight"
                class="min-h-11 rounded-xl border-2 border-[#2c8d98]/40 bg-white px-3 text-sm font-bold text-[#263236] outline-none focus:border-[#2c8d98]"
                @change="isConfirmingAllocation = false"
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
              <div class="grid grid-cols-7 gap-1">
                <label
                  v-for="(weekday, index) in weekdays"
                  :key="weekday"
                  class="flex min-h-11 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 text-xs font-black transition"
                  :class="allocationOptionsFor(allocationTarget.id).restDays.includes(index)
                    ? 'border-[#263236]/40 bg-[#263236]/10 text-[#263236]/60'
                    : 'border-[#2c8d98]/40 bg-white text-[#263236]'"
                >
                  <input
                    v-model="allocationOptionsFor(allocationTarget.id).restDays"
                    type="checkbox"
                    :value="index"
                    class="h-3.5 w-3.5 accent-[#263236]"
                    @change="isConfirmingAllocation = false"
                  >
                  {{ weekday }}
                </label>
              </div>
            </fieldset>

            <p
              v-if="allocationPlan?.blockReason"
              class="rounded-xl bg-[#edf6fa] px-3 py-2 text-xs font-bold text-[#263236]/60"
            >
              {{ allocationPlan.blockReason }}
            </p>

            <template v-else-if="allocationPlan">
              <div
                v-if="isConfirmingAllocation"
                class="grid gap-2 rounded-xl border-2 border-[#f36b00]/40 bg-[#fff2e3] p-3 text-xs font-bold text-[#263236]"
                role="alert"
              >
                <p>
                  {{ formatAllocationRange(allocationPlan) }} の {{ allocationPlan.workDayCount }}日<span v-if="allocationPlan.restDayCount">（休み {{ allocationPlan.restDayCount }}日）</span>に
                  {{ formatWorkDuration(allocationPlan.totalMinutes) }} を割り振ります。
                </p>
                <p v-if="allocationPlan.weekdayRange">
                  平日 {{ formatMinutesRange(allocationPlan.weekdayRange) }}
                </p>
                <p v-if="allocationPlan.weekendRange">
                  土日 {{ formatMinutesRange(allocationPlan.weekendRange) }}
                </p>
                <p
                  v-if="allocationPlan.overwriteCount"
                  class="font-black text-[#f36b00]"
                >
                  既存の予定 {{ allocationPlan.overwriteCount }}日分は上書きされます。
                </p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="min-h-11 flex-1 rounded-xl border-2 border-[#f36b00] bg-[#f36b00] px-3 text-xs font-black text-white transition hover:bg-[#e06200]"
                    @click="confirmAllocation"
                  >
                    {{ allocationPlan.overwriteCount ? '上書きする' : '割り振る' }}
                  </button>
                  <button
                    type="button"
                    class="min-h-11 flex-1 rounded-xl border-2 border-[#263236]/30 bg-white px-3 text-xs font-black text-[#263236] transition hover:bg-[#f7fcfd]"
                    @click="isConfirmingAllocation = false"
                  >
                    やめる
                  </button>
                </div>
              </div>

              <button
                v-else
                type="button"
                class="min-h-11 rounded-xl border-2 border-[#2c8d98] bg-[#2c8d98] px-3 text-sm font-black text-white transition hover:bg-[#247a84]"
                @click="isConfirmingAllocation = true"
              >
                割り振る
              </button>
            </template>
          </div>
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
import { formatProjectDate } from "~/utils/projectDisplay";

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

type WorkTotals = {
  planned: number;
  actual: number;
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
} = useProjects();
const {
  calculateRemainingWork,
  formatWorkDuration,
} = useProgress();

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const workBarUnit = 60;
const maxCollapsedWorkBars = 4;
// カード内のバーは圧縮せず、この本数ごとに右の列へ積み上げる。
const projectWorkBarsPerColumn = 8;
const plannedMinuteSteps = [0, 15, 30, 45];
const plannedSteps = [
  { amount: -30, label: "−30m", ariaLabel: "予定を30分減らす" },
  { amount: 30, label: "+30m", ariaLabel: "予定を30分増やす" },
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
const showCompletedPages = ref<Record<string, boolean>>({});
// 自動割り振りのオプションは保存せず、画面を開いている間だけプロジェクト別に保持する。
const allocationOptions = ref<Record<string, AllocationOptions>>({});
const allocationTargetId = ref<string | null>(null);
const isConfirmingAllocation = ref(false);
const closeAllocationButton = ref<HTMLButtonElement | null>(null);
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

const allocationTarget = computed(() => {
  return projects.value.find((project) => project.id === allocationTargetId.value) ?? null;
});

const allocationPlan = computed(() => {
  return allocationTarget.value ? buildAllocationPlan(allocationTarget.value) : null;
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
  if (event.key !== "Escape") return;

  // 割り振りダイアログが開いているときは、手前のダイアログだけを閉じる。
  if (allocationTarget.value) {
    closeAllocationDialog();
    return;
  }

  if (isWorkPanelOpen.value) {
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
  // 選択中の週以外は最大本数へ圧縮し、月表示の密度を保つ。
  return createWorkBars(
    dayTotals(dateKey),
    shouldShowAllBars(dateKey) ? Infinity : maxCollapsedWorkBars
  );
}

function projectWorkBarColumns(projectId: string) {
  const bars = createWorkBars(
    {
      planned: dailyEntry(projectId).planned,
      actual: dailyActual(projectId),
    },
    Infinity
  );
  const columns: typeof bars[] = [];

  // barsは上（大きいlevel）から並ぶので、levelで列を決めて下から8本ずつ積む。
  for (const bar of bars) {
    const columnIndex = Math.floor(bar.level / projectWorkBarsPerColumn);
    (columns[columnIndex] ??= []).push(bar);
  }

  return columns;
}

function createWorkBars(totals: WorkTotals, maxBars: number) {
  const plannedBars = Math.ceil(totals.planned / workBarUnit);
  const actualBars = Math.ceil(totals.actual / workBarUnit);
  const totalBars = Math.max(plannedBars, actualBars);
  const isCollapsed = totalBars > maxBars;
  const visibleBars = isCollapsed
    ? maxBars
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
  plannedFillPercent: number;
  isPlanned: boolean;
  isActual: boolean;
  isOverActual: boolean;
  isCompressed: boolean;
}) {
  if (bar.isCompressed) {
    // 予定内の青い部分を含むバーは枠線を青のままにし、超過分だけのバーを赤枠にする。
    return bar.isOverActual && bar.plannedFillPercent <= 0
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

function plannedMinuteOptions(planned: number) {
  // 自動割り振りなどで15分単位以外の値が入っていても、選択肢に出して表示を崩さない。
  return [...new Set([...plannedMinuteSteps, planned % 60])].sort((a, b) => a - b);
}

function handlePlannedPart(projectId: string, part: "hours" | "minutes", event: Event) {
  const field = event.target as HTMLInputElement | HTMLSelectElement;
  const current = dailyEntry(projectId).planned;
  const value = Number(field.value);
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const hours = part === "hours" ? safeValue : Math.floor(current / 60);
  const minutes = part === "minutes" ? safeValue : current % 60;
  // 入力は確定時（blur/Enter/選択）だけ保存して、1文字ごとの書き込みを避ける。
  const planned = savePlannedEntry(projectId, hours * 60 + minutes);

  // 上限で丸めて値が変わらなかった場合も、入力欄を保存後の値へ戻す。
  field.value = String(part === "hours" ? Math.floor(planned / 60) : planned % 60);
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

function dailyGuideTarget(project: Project) {
  // 今日の作業済み分は残り作業時間から引かれているため、予定には上乗せして入れる。
  const base = selectedDateMode.value === "today" ? dailyActual(project.id) : 0;

  return base + dailyGuide(project);
}

function isDailyGuideApplied(project: Project) {
  return dailyEntry(project.id).planned === dailyGuideTarget(project);
}

function applyDailyGuide(project: Project) {
  savePlannedEntry(project.id, dailyGuideTarget(project));
}

function allocationOptionsFor(projectId: string): AllocationOptions {
  // 描画中に状態を書き換えないよう、初期化はダイアログを開いたときに行う。
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

async function openAllocationDialog(projectId: string) {
  allocationOptions.value[projectId] ??= allocationOptionsFor(projectId);
  delete allocationDoneNotices.value[projectId];
  isConfirmingAllocation.value = false;
  allocationTargetId.value = projectId;

  await nextTick();
  closeAllocationButton.value?.focus();
}

function closeAllocationDialog() {
  allocationTargetId.value = null;
  isConfirmingAllocation.value = false;
}

function confirmAllocation() {
  const project = allocationTarget.value;
  const plan = allocationPlan.value;
  if (!project || !plan || plan.blockReason) return;

  // 今日以降の予定（締切後も含む）をまとめて置き換え、残り作業時間の上限を超えないようにする。
  replacePlannedEntries(project.id, formatDateKey(new Date()), plan.plannedByDate);
  delete plannedClampNotices.value[project.id];
  allocationDoneNotices.value[project.id] = true;
  closeAllocationDialog();
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
</script>
