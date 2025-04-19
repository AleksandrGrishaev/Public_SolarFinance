Давай еще раз, проанализируем логику работы страницы.

# структура файлов: 

src/components/ui/filters/DateFilter.vue
src/composables/transaction/useFormatBalance.ts
src/composables/useDateFilter.ts

src/views/book
src/views/book/page
src/views/book/page/components
src/views/book/page/components/BaseAddIcon.vue
src/views/book/page/components/BookFinanceSummary.vue
src/views/book/page/components/BookPercentageSlider.vue
src/views/book/page/components/BookSelector.vue
src/views/book/page/components/BookTransactionGroup.vue
src/views/book/page/components/BookTransactionItem.vue
src/views/book/page/components/BookTransactionsList.vue
src/views/book/page/components/DashBoardBook.vue
src/views/book/page/composables
src/views/book/page/composables/useBookData.ts
src/views/book/page/composables/useBookFinanceSummary.ts
src/views/book/page/composables/useFormatting.ts
src/views/book/page/composables/useOwnerDistribution.ts
src/views/book/page/BooksView.vue



## BooksView.vue
src/views/book/page/BooksView.vue - страница, состоит из двух компонентов: 

    src/views/book/page/components/BookSelector.vue - выбор книги
    src/views/book/page/components/DashBoardBook.vue - информация на странице

## BookSelector.vue 
Выбор книги или книг и создание новой

## DashBoardBook.vue 
Это информация по выбранной книги (книгам)

src/views/book/page/components/BookFinanceSummary.vue
src/views/book/page/components/BookTransactionsList.vue

## BookFinanceSummary.vue
Это инфомрация по книги и фильтр

Информация по выбранной книги и фильтру - useBookData.ts
Понять какая книга выбрана, и какие фильтры по дате выбраны. 

По сути мне надо получить данные 
Total, income, expense - за это отвечает [создать отдельный composable]
Данные для слайдера - за это отвечает useOwnerDistribution.ts

за стили отвечает - useFormatting.ts



### src/components/ui/filters/DateFilter.vue

### src/views/book/page/components/BookPercentageSlider.vue

### composables src/views/book/page/composables/useOwnerDistribution.ts

Нужен для расчета показаний для BookFinanceSummary

src/views/book/page/composables/useBookData.ts
src/views/book/page/composables/useBookFinanceSummary.ts
src/views/book/page/composables/useFormatting.ts


Логика работы компонента

Выбор книги: 
1. Выбираем книгу или книги. 
2. Проверяем е в книге правила распределения или нет. Если их нет не показываем слайдер. Если есть показываем. Если мы выбрали больше одной книги и в хоть в одной есть распределение, до мы показываем слайдер.
3. Дальше мы применяем фильтр по датам.

Общий расчет сумм:
Считаем суммы Total, income, expense

Слайдер:
1. Если есть слайдер мы находим форматы для пользователей из User Store их имена и цвет, отображаем. 
2. Расчитываем кто, сколько потратил. Если выбрано много книг, те что без распределения, траты суммируются к владельцу этой книги. 
5. Дальше мы расчитываем проценты за заданный период и по заданным книгам.

