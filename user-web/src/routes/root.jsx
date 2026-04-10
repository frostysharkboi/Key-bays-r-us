export default function Root(){
     return (
    <>
    <div className="container-fluid">
      {/*Nagłówek Strony*/}
      <div className="row m-3 p-3 text-center">

        {/* Wyszukiwarka */}
        <div className='col-4'>
          <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...'/>
        </div>

        {/* Logo, wiadomo */}
        <div className='col-4'>
          <h1>Key&apos; R&apos; Us</h1>
        </div>

        {/* Dropdown menu konta */}
        <div className='col-4'>
          <div className="dropdown">
          <button className="dropbtn">Dropdown</button>
            <div className="dropdown-content">
              <a href="#">Link 1</a>
              <a href="#">Link 2</a>
              <a href="#">Link 3</a>
            </div>
          </div> 

        </div>
      </div>
    
      {/* Baner */}
      <div className="row m-3 p-3 text-center">

        <img src="https://store-images.s-microsoft.com/image/apps.5012.65806558541457305.a0ff0982-eced-4bfd-bb78-5ba7a73376c4.069fcd98-6d14-48a3-82a3-074b07fb3acb?q=90&w=480&h=270" className='mx-auto w-25 h-25 rounded'/>

      </div>

      {/* Karulezela */}
      <div className="row m-3 p-3 text-center">
        <div id="carouselExampleSlidesOnly" class="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-touch="false">
          <div className="carousel-inner">
            <div className="carousel-item active" data-bs-interval="10">
              <img src="https://store-images.s-microsoft.com/image/apps.5012.65806558541457305.a0ff0982-eced-4bfd-bb78-5ba7a73376c4.069fcd98-6d14-48a3-82a3-074b07fb3acb?q=90&w=480&h=270" className="mx-auto d-block w-25 h-25" alt="..."/>
              <div className="carousel-caption d-none d-md-block">
                <h5>TEMP GAME #1</h5>
                <p>Some representative placeholder content for the first slide.</p>
              </div>
            </div>
            <div className="carousel-item" data-bs-interval="10">
              <img src="https://store-images.s-microsoft.com/image/apps.5012.65806558541457305.a0ff0982-eced-4bfd-bb78-5ba7a73376c4.069fcd98-6d14-48a3-82a3-074b07fb3acb?q=90&w=480&h=270" className="mx-auto d-block w-25 h-25" alt="..."/>
              <div className="carousel-caption d-none d-md-block">
                <h5>TEMP GAME #2</h5>
                <p>Some representative placeholder content for the first slide.</p>
              </div>
            </div>
            <div className="carousel-item" data-bs-interval="10">
              <img src="https://store-images.s-microsoft.com/image/apps.5012.65806558541457305.a0ff0982-eced-4bfd-bb78-5ba7a73376c4.069fcd98-6d14-48a3-82a3-074b07fb3acb?q=90&w=480&h=270" className="mx-auto d-block w-25 h-25" alt="..."/>
              <div className="carousel-caption d-none d-md-block">
                <h5>TEMP GAME #3</h5>
                <p>Some representative placeholder content for the first slide.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gatunki */}
      <div className='row m-1 text-center'>
          <h2>GATUNKI</h2>
      </div>
      <div className="row row-cols-4 justify-content-md-center m-3 p-3 text-center">
      {/* 
      
      Myślałem, żeby wrzucić tu pętle, która by przeszukiwała baze w poszukiwaniu gatunków gier i na podstawie znalezionych gatunków wypisywała je w kartach poniżej. 
      
      */}

      {/*
      
      {data.map((tags) => (
          <div className="card col p-4 m-3" key={tags.id}>
            <div className="card-body w-40">
              <p className="card-text w-40">{tags.tag}</p>
            </div>
          </div>
      ))}
      
      */}
        

      </div>

      {/* Stopka */}
      <div className="row m-3 p-3 text-center">
        <div className='col'>
          <p>Kontakt</p>
          <p>Telefon: 112</p>
          <p>Mail: @gmail.com</p>          
        </div>
      </div>
    </div>
    </>
  )
}