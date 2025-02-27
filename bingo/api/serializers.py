from rest_framework import serializers, pagination
from bingo.models import BingoUser, BingoDailyRecord, BingoTransaction

class BingoTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BingoTransaction
        fields = '__all__'

class BingoDailyRecordSerializer(serializers.ModelSerializer):
    transactions = serializers.SerializerMethodField()
    
    class Meta:
        model = BingoDailyRecord
        fields = '__all__'
    
    def get_transactions(self, obj):
        request = self.context.get('request')
        paginator = pagination.PageNumberPagination()
        paginator.page_size = 10  # Set page size
        transactions = BingoTransaction.objects.filter(daily_record=obj)
        result_page = paginator.paginate_queryset(transactions, request)
        return BingoTransactionSerializer(result_page, many=True).data

class BingoUserSerializer(serializers.ModelSerializer):
    daily_records = serializers.SerializerMethodField()
    
    class Meta:
        model = BingoUser
        # fields = ['display_name', 'email', 'balance', 'credit', 'branch', 'cut_percentage', 'daily_records']
        fields = '__all__'
    
    # def get_daily_records(self, obj):
    #     request = self.context.get('request')
    #     paginator = pagination.PageNumberPagination()
    #     paginator.page_size = 5  # Set page size
    #     records = BingoDailyRecord.objects.filter(user=obj)
    #     result_page = paginator.paginate_queryset(records, request)
    #     return BingoDailyRecordSerializer(result_page, many=True, context={'request': request}).data
    def get_daily_records(self, obj):
        request = self.context.get('request')  # Get the request from context
        if request is None:
            return []  # Handle case where request is missing (e.g., for internal calls)
        
        records = obj.bingo_record.all()
        paginator = MyPaginator()  # Ensure you have a paginator instance
        result_page = paginator.paginate_queryset(records, request)
        return BingoDailyRecordSerializer(result_page, many=True, context={'request': request}).data


from rest_framework.pagination import PageNumberPagination

class MyPaginator(PageNumberPagination):
    page_size = 10  # Number of items per page
    page_size_query_param = 'page_size'  # Allow clients to control page size
    max_page_size = 100  # Limit maximum items per page
