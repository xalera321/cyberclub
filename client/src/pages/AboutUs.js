import React from 'react';

function AboutUs() {
  return (
    <div>
        <div class="container text-center text-white mt-3">
        <h1 class="mb-3">О НАС</h1>
        <div class="row align-items-center text-start justify-content-center">
          <div class="col-md-6 display-flex align-items-center">
            <img src="first_image.png" class="img-fluid mx-auto d-block" alt=""></img>
          </div>
          <div class="col-md-6">
           <p class="text-justify">Добро пожаловать в наш компьютерный клуб! Наша компания - это центр, где страсть к технологиям сочетается с уютной атмосферой. Мы являемся приветливым сообществом энтузиастов, ценящих мир высоких технологий и игр. Мы регулярно организовываем турниры и специальные мероприятия.</p>
          </div>
        </div>
        <div class="row align-items-center text-start">
          <div class="col-md-6 fs-6">
           <p class="text-justify">Наша команда профессионалов всегда готова помочь с техническими вопросами, обеспечивая комфортное времяприпровождение в нашем клубе. Мы стремимся создать место, где любители компьютерных технологий найдут не только отличные условия для игр, но и дружественное сообщество, где каждый чувствует себя как дома.</p>
          </div>
          <div class="col-md-6">
            <img src="second_image.png" class="img-fluid mx-auto d-block" alt=""></img>
          </div>
        </div>
      </div>
    </div>

  );
}

export default AboutUs;
