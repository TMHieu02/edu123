import React from "react";

const PaginationNew = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageClick = (pageNumber) => {
    onPageChange(pageNumber);
  };

  return (
     <div  style={{ display: 'flex', alignContent: 'center', justifyContent: 'center' , width: '100%'}}>    
     <ul className="pagination">
       {currentPage > 1 ? (
         <li className="page-item">
           <button
             className="page-link"
             onClick={() => handlePageClick(currentPage - 1)}
           >
             Previous
           </button>
         </li>
       ) : (
         <li className="page-item">
           <button className="page-link">Previous</button>
         </li>
       )}
       {Array.from({ length: totalPages }, (_, index) => (
         <li
           className={`page-item ${index + 1 === currentPage ? "active" : ""}`}
           key={index}
         >
           <button
             className="page-link"
             onClick={() => handlePageClick(index + 1)}
             disabled={index + 1 === currentPage}
           >
             {index + 1}
           </button>
         </li>
       ))}
       {currentPage < totalPages ? (
         <li className="page-item">
           <button
             className="page-link"
             onClick={() => handlePageClick(currentPage + 1)}
             disabled={currentPage === totalPages}
           >
             Next
           </button>
         </li>
       ) : (
         <li className="page-item">
           <button className="page-link">Next</button>
         </li>
       )}
     </ul>
   
   </div>
  );
};

export default PaginationNew;
