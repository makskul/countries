<template>
  <div class="about-page">
    <div class="about-container">
      <div class="about-header">
        <span class="about-pill">Про проект</span>
        <h1>Як це працює</h1>
        <p class="about-lead">NationView — платформа відгуків емігрантів, відфільтрованих за національністю. Дізнайся країну очима людей як ти.</p>
      </div>

      <div class="about-steps">
        <div class="about-step">
          <div class="step-num">1</div>
          <div>
            <h3>Обери свою національність</h3>
            <p>Всі відгуки фільтруються за твоєю національністю. Ти бачиш досвід людей з тієї самої країни що й ти.</p>
          </div>
        </div>
        <div class="about-step">
          <div class="step-num">2</div>
          <div>
            <h3>Знайди цікаву країну</h3>
            <p>Переглянь рейтинги по легалізації, цінах, безпеці, відношенню до іноземців та інших категоріях.</p>
          </div>
        </div>
        <div class="about-step">
          <div class="step-num">3</div>
          <div>
            <h3>Читай реальні відгуки</h3>
            <p>Тільки перевірені відгуки від реальних людей. Без реклами, без замовних матеріалів.</p>
          </div>
        </div>
        <div class="about-step">
          <div class="step-num">4</div>
          <div>
            <h3>Поділись своїм досвідом</h3>
            <p>Якщо ти жив або подорожував — залиш відгук. Анонімно. Допоможи іншим прийняти правильне рішення.</p>
          </div>
        </div>
      </div>

      <div class="about-mission">
        <h2>Наша місія</h2>
        <p>Ми віримо, що найкоріснішою інформацією про життя в іншій країні є досвід людей, які вже там жили. І цей досвід дуже відрізняється залежно від того, звідки ти родом.</p>
        <p>Українець і індієць матимуть зовсім різний досвід в Португалії: різні вимоги до візи, різне ставлення місцевих, різні можливості для роботи. NationView дозволяє це побачити.</p>
      </div>

      <div class="about-cta">
        <h2>Готовий поділитися?</h2>
        <p>Твій відгук допоможе сотням людей прийняти зважене рішення.</p>
        <NuxtLink to="/review/new">
          <button class="about-btn">+ Написати відгук</button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
  title: () => t('seo.about.title'),
  description: () => t('seo.about.description'),
  robots: 'index, follow',
})
</script>

<style scoped>
.about-page { background: var(--color-bg-secondary); min-height: 100vh; padding: 40px 24px; }
.about-container { max-width: 760px; margin: 0 auto; }
.about-header { text-align: center; margin-bottom: 48px; }
.about-pill {
  display: inline-block;
  background: var(--color-primary-light); color: var(--color-primary);
  font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em;
  border-radius: var(--radius-pill); padding: 5px 12px; margin-bottom: 16px;
}
.about-header h1 { font-size: 32px; font-weight: 700; margin: 0 0 12px; color: var(--color-text); }
.about-lead { font-size: 17px; color: var(--color-text-secondary); line-height: 1.6; margin: 0; }
.about-steps { display: flex; flex-direction: column; gap: 0; margin-bottom: 48px; }
.about-step {
  display: flex; align-items: flex-start; gap: 20px;
  background: #fff; border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 20px 24px; margin-bottom: 10px;
}
.step-num {
  width: 36px; height: 36px; flex-shrink: 0;
  background: var(--color-primary); color: #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700;
}
.about-step h3 { font-size: 16px; font-weight: 600; margin: 0 0 6px; color: var(--color-text); }
.about-step p { font-size: 14px; color: var(--color-text-secondary); margin: 0; line-height: 1.6; }
.about-mission {
  background: #fff; border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 28px; margin-bottom: 24px;
}
.about-mission h2 { font-size: 20px; font-weight: 600; margin: 0 0 16px; color: var(--color-text); }
.about-mission p { font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin: 0 0 12px; }
.about-cta {
  background: var(--color-primary-light); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 32px; text-align: center;
}
.about-cta h2 { font-size: 20px; font-weight: 600; margin: 0 0 8px; color: var(--color-primary-dark); }
.about-cta p { font-size: 14px; color: var(--color-text-secondary); margin: 0 0 20px; }
.about-btn {
  background: var(--color-primary); color: #fff; border: none;
  border-radius: var(--radius-pill); padding: 11px 24px;
  font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.about-btn:hover { background: var(--color-primary-hover); }
</style>
