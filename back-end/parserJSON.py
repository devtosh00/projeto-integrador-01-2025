import json
from typing import Dict, Any, Union, List, Tuple

class JSONParser:
    """
    Class to handle parsing and formatting of JSON requests and responses
    for the CDC semantic search API.
    """
    
    @staticmethod
    def parse_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse and validate incoming JSON request.
        
        Args:
            request_data: The JSON data from request
            
        Returns:
            Dictionary with parsed and validated fields
            
        Raises:
            ValueError: If required fields are missing or invalid
        """
        # Validate required fields
        if not request_data:
            raise ValueError("Empty request data")
        
        # Process content field for search query
        content = request_data.get('content')
        if not content:
            raise ValueError("Missing 'content' field in request")
        
        # Process additional parameters if they exist
        limit = request_data.get('limit', 10)  # Default limit of 10 results
        offset = request_data.get('offset', 0)  # Default offset of 0
        
        # Return standardized request object
        return {
            'content': content,
            'limit': limit,
            'offset': offset,
            'filters': request_data.get('filters', {})
        }
    
    @staticmethod
    def format_response(results: List[Tuple], fields: List[str] = None) -> Dict[str, Any]:
        """
        Format database results into standardized JSON response.
        
        Args:
            results: List of database result tuples
            fields: Optional list of field names for the results
            
        Returns:
            Formatted response dictionary
        """
        if fields is None:
            # Default field names for documents table
            fields = ['id', 'content', 'embedding']
        
        formatted_results = []
        for row in results:
            # Convert result tuples to dictionaries with field names
            result_dict = {fields[i]: value for i, value in enumerate(row) 
                           if i < len(fields) and fields[i] != 'embedding'}
            formatted_results.append(result_dict)
        
        return {
            'status': 'success',
            'count': len(formatted_results),
            'results': formatted_results
        }
    
    @staticmethod
    def format_error(error_message: str, status_code: int = 400) -> Dict[str, Any]:
        """
        Format error responses.
        
        Args:
            error_message: Error description
            status_code: HTTP status code
            
        Returns:
            Error response dictionary
        """
        return {
            'status': 'error',
            'code': status_code,
            'message': error_message
        }